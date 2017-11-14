(function(root, factory){
    if (typeof define === 'function' && define.amd){
        define([
            'request',
            'xml2js',
            'lodash',
            'async-arrays',
            'xmldom'
        ], factory);
    }else if(typeof exports === 'object'){
        module.exports = factory(
            require('request'),
            require('xml2js'),
            require('lodash'),
            require('async-arrays'),
            require('xmldom')
        );
    }else{
        //todo: shim things to work in a browser
        root.TopicExtraction = factory({});
    }
}(this, function(request, xml2js, _, arrays, xmldom){
    var domParser = new xmldom.DOMParser({
        errorHandler:{
            warning:function(){},
            error:function(){},
            fatalError:function(){}
        }
    });

    function objectToQuery(){

    }

    function Cyc(options){
        this.options = options || {};
        if(!this.options.host) this.options.host = 'localhost';
        if(!this.options.port) this.options.port = 3602;
        if(!this.options.protocol) this.options.protocol = 'http';
    }

    Cyc.prototype.urlBase = function(){
        return this.options.protocol + '://' + this.options.host + ':' + this.options.port;
    };

    Cyc.prototype.concepts = function(name, callback){
        var url = this.urlBase();
        var str = name.replace(' ', '');
        var prefix = encodeURIComponent(str);
        var results = {};
        var finish = function(){
            if(results.search && results.match){
                var suggestions = [];
                var matches = [];
                results.search.forEach(function(result){
                    var found;
                    results.match.forEach(function(match){
                        if(match.name == result.name){
                            match.reference = result.reference
                            found = true;
                            if(match.name.substring(0, str.length) === str){
                                matches.push(match)
                            }else{
                                suggestions.push(match);
                            }
                        }
                    });
                    if(!found) suggestions.push(result);
                });
                callback(undefined, {
                    matched : matches,
                    suggested : suggestions
                });
            }
        }
        request({
            uri:url+'/cgi-bin/cg?xml-complete&prefix='+prefix
        }, function(err, res, body){
            xml2js.parseString(body, function(err, data){
				if (err) return callback(err);
                if(!(data && data.ResultSet && data.ResultSet.Term)){
                    results.search = [];
                    finish();
                }else{
                    results.search = data.ResultSet.Term.map(function(concept){
    					return {
    						name: concept['$'].nl,
    						reference: concept['$'].cycl,
    					};
    				});
                    finish();
                }
			});
        });
        function dump(ob){
            console.log(JSON.stringify(ob, undefined, '  '));
        }
        request({
            uri:url+'/cgi-bin/cg?cb-handle-specify=&query='+prefix
        }, function(err, res, body){
            var links = body.split("\n").filter(function(line){
                return line.indexOf('<a ') !== -1 && line.indexOf('</a>') !== -1;
            }).map(function(line){
                return line.substring(line.indexOf('<a '), line.indexOf('</a>')+4);
            }).map(function(line){
                var result = {
                    link : line.match(/href="(.+?)"/)[1],
                    name : line.match(/>(.+?)</)[1]
                };
                result.id = result.link.substring(result.link.indexOf('&')+1)
                return result;
            }).filter(function(line){
                return line.link.substring(0, 2) === 'cg' && line.link.indexOf('page') === -1;
            });
            arrays.forEachEmission(links, function(result, key, done){
                request({
                    uri:url+'/cgi-bin/cg?cb-content-frame&'+result.id
                }, function(err, res, body){
                    var html = body
                        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
                        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
                    var lines = html.split("\n");
                    var final = lines.slice(
                            lines.indexOf('<strong>on  the term</strong><br />')
                        ).join("\n").replace('</html>', '')
                            .replace('</body>', '').trim();
                    var xmlStringSerialized = domParser
                        .parseFromString('<div>'+final+'</div>', "text/xml");
                    var rowToArray = function(row){
                        return row.td.map(function(duo){
                            if(duo.strong){
                                return {relation: duo.strong[0].a[0]['_']};
                            }
                            if(!(duo.nobr && duo.nobr[0].span)) return {};
                            var link = duo.nobr[0].span[0].a;
                            if(!link[1]) return {};
                            var results = link[1]['$'];
                            results.name = link[1]['_'];
                            return results;
                        });
                    }
                    var flattenAllRows = function(rows){
                        if(rows.length == 1) return [rowToArray(rows[0])];
                        return rows.reduce(function(rowA, rowB){
                            if(!rowA) return rowB;
                            if(!rowB) return rowA;
                            if(!Array.isArray(rowA)) rowA = rowToArray(rowA);
                            if(!Array.isArray(rowB)) rowB = rowToArray(rowB);
                            return rowA.concat(rowB);
                        });
                    }
                    xml2js.parseString(xmlStringSerialized, function(err, data){
                        var parsed = data.div.table.map(function(row){
                            return flattenAllRows(row.tr);
                        });
                        var currentRelation;
                        var relations = [];
                        parsed.map(function(item){
                            return item[0];
                        }).reduce(function(a, b){
                            return a.concat(b);
                        }).forEach(function(item){
                            if(item.relation){
                                if(currentRelation){
                                    relations.push(currentRelation);
                                }
                                currentRelation = {
                                    relation : item.relation,
                                    concepts : []
                                };
                            }else if(
                                currentRelation && Object.keys(item).length
                            ) currentRelation.concepts.push(item);
                        });
                        if(currentRelation){
                            relations.push(currentRelation);
                        }
                        links[key].relations = relations;
                        done();
        			});
                });
            }, function(){
                results.match = links;
                finish();
            });
        });
    };

    Cyc.prototype.inference = function(query, callback){

    };

    return Cyc;
}));
