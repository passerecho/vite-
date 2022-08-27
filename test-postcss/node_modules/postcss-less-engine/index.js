var postcss = require('postcss')
	, Input = require('postcss/lib/input')
	, CssSyntaxError = require('postcss/lib/css-syntax-error')
	, less = require('less');


var render = require("./lib/render")(less.ParseTree, less.transformTree);

function LessPlugin() {
	var cacheInput;

	var plugin = postcss.plugin('postcss-less-engine', function (opts) {
	    opts = opts || {};
	    
	    return function (css, result) {

	    	// Add PostCSS options to Less options
	    	// TODO - outfile for source map
	    	css.source = {};
	    	if(opts.filename) {
	    		css.source.input = {
	    			file: opts.filename
	    		};
	    	}
	    	else if(result.opts.from) {
	    		css.source.input = {
	    			file: result.opts.from
	    		};
	    		opts.filename = result.opts.from;
	    	}
	    	css.source.start = { 
	        	line: 1
	        	, column: 1
	        };

	    	// Most of Less's nodes require an object to be passed with this structure.
	     	// It makes it hard to just stringify anything, because of Less's "context" and "output" paramaters that
	     	// are required for many class functions.
	    	var returnObj, context, postCssInputs = {};

	    	// Less's importManager is like PostCSS's Input class.
	    	// We need to convert our inputs to reference them later.
	    	function convertImports(imports) {
		    	for (var file in imports) {
				    if (imports.hasOwnProperty(file)) {
				        postCssInputs[file] = new Input(imports[file], file !== "input" ? { from: file } : undefined);
				    }
				}
			}

	     	function buildNodeObject(filename, index, chunk) {
	     		var input = postCssInputs[filename],
		            loc = less.utils.getLocation(index, input.css);

		        return {
		        	stringValue: chunk
		        	, source: {
		        		// The Less parser only tracks starting indices, which should still work for sourcemaps.
						start: { 
				        	line: loc.line + 1
				        	, column: loc.column + 1
				        }
		        		, input: input
		        	}
		        };
	     	}
	     	
	     	var output = { 
	     		add: function(chunk, fileInfo, index) {
	     			if(chunk === "") return;

	     			if(returnObj === "" && fileInfo && index) {
	     				return returnObj = buildNodeObject(fileInfo.filename, index, chunk);
			        }
		        	returnObj.stringValue += chunk;
		        }
		    };
		    function getObject(lessNode, init) {
		    	// Initialize the string
		    	if(init) 
		    		returnObj = { stringValue: "" };
		    	try {
		    		if(lessNode.genCSS)
		    			lessNode.genCSS(context, output);
		    	}
		    	catch(ex) {}

		    	return returnObj;
		    }
		    var process = {
		    	// PostCSS "at-rule"
		    	directive: function(directive) {

		    		var filename = directive.path 
		    			? directive.path.currentFileInfo.filename
		    			: directive.currentFileInfo.filename;
		    		var val, node, nodeTmp = buildNodeObject(filename, directive.index);

		    		if(!directive.path) {
			    		if(directive.features) {
			    			val = getObject(directive.features, true).stringValue;
			    		}
			    		else {
							val = getObject(directive.value, true).stringValue;
			    		}
			    	}
			    	else {
			    		val = directive.path.quote + directive.path.value + directive.path.quote;
			    	}

		    		node = {
		    			type: ""
		    		};

		    		if(directive.type === 'Media') {
		    			node.name = 'media';
		    		}
		    		else if(directive.type === 'Import') {
		    			node.name = 'import';
		    		}
		    		else {
		    			// Remove "@" for PostCSS
		    			node.name = directive.name.replace('@','');
		    		}

		    		node.source = nodeTmp.source;
		    		node.params = val;
		    		
		    		var atrule = postcss.atRule(node);

		    		if(directive.rules) {
		    			atrule.nodes = [];
		    			processRules(atrule, directive.rules);
		    		}
		    		return atrule;
		    	}
		    	// PostCSS "rule"
		    	, ruleset: function(ruleset) {
		    		var i = 0, selectors = [];
		    		var val, tmpObj, node, path, pathSubCnt, paths = ruleset.paths;

		    		// Less rulesets aren't completely flat at this stage.
		    		// They need one more good flattening. From lib/less/tree/ruleset.js

		    		if(paths) {
			    		for (i = 0; i < paths.length; i++) {
				            path = paths[i];
				            if (!(pathSubCnt = path.length)) { continue; }

				            if(i === 0) {
		    					tmpObj = buildNodeObject(ruleset.selectors[0].elements[0].currentFileInfo.filename, ruleset.selectors[0].elements[0].index);
		    					node = {
		    						type: "rule"
		    						, nodes: []
		    						, source: tmpObj.source
		    					};
		    					context.firstSelector = true;
		    					getObject(path[0], true);
		    					context.firstSelector = false;
		    				}
		    				else {
		    					getObject(path[0], true);
		    				}

				            for (j = 1; j < pathSubCnt; j++) {
				            	getObject(path[j]);
				            }
				            selectors.push(returnObj.stringValue.trim());
				        }
				    }
				    else {
				    	var selector;
				    	for (i = 0; i < ruleset.selectors.length; i++) {
				    		selector = ruleset.selectors[i];
		    				if(i === 0) {
		    					tmpObj = buildNodeObject(selector.elements[0].currentFileInfo.filename, selector.elements[0].index);
		    					node = {
		    						type: "rule"
		    						, nodes: []
		    						, source: tmpObj.source
		    					};
		    				}
		    				val = getObject(selector, true);

		    				if(val.stringValue)
		    					selectors.push(val.stringValue.trim());

		    				i++;
				    	}
			    	}

	    			node.selectors = selectors;

	    			var rule = postcss.rule(node);
	    			processRules(rule, ruleset.rules);
	    			return rule;
		    	}
		    	// PostCSS "decl"
		    	, rule: function(rule) {
		    		var node, tmpObj = buildNodeObject(rule.currentFileInfo.filename, rule.index);
		    		var evalValue = getObject(rule.value, true);

		    		node = {
		    			type: "decl"
		    			, source: tmpObj.source
		    			, prop: rule.name
		    			, value: evalValue.stringValue
		    		};
		    		
		    		var testImportant;
		    		if(rule.important.indexOf("!") > -1) {
		    			node.important = true;
		    		}
		    		// Currently, Less doesn't separate the important flag if it's not assigned to a variable
		    		// This may change but if so, this should still work.
		    		else {
		    			testImportant = /([^!]*)(! *important)/.exec(node.value);
		    			if(testImportant && testImportant[2] !== '') {
		    				node.important = true;
		    				node.value = testImportant[1].trim();
		    			}
		    		}

		    		return postcss.decl(node);
		    	}
		    	, comment: function(comment) {
		    		
		    		var node, tmpObj = buildNodeObject(comment.currentFileInfo.filename, comment.index);
		    		node = {
		    			type: "comment"
		    			
		    			// TODO: Less has a bug where it wasn't setting the index for Comment nodes
		    			//  after fix is released for Less, uncomment and update tests
		    			//, source: tmpObj.source

		    			// PostCSS requires comments to come without comment marks
		    			, text: comment.value.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '')
		    		};
		    		return postcss.comment(node);
		    	}
		    };
	    	function processRules(container, rulesArray) {

	    		if(rulesArray && rulesArray.length > 0) {
		    		rulesArray.forEach(function(val) {
		    			// a.k.a. PostCSS "rule"
		    			if(val instanceof less.tree.Ruleset) {
		    				var ruleset = process.ruleset(val);
		    				if(ruleset.selector === '&' || ruleset.selector === '') {
		    					container.append(ruleset.nodes);
		    				}
		    				else {
		    					container.append(ruleset);
		    				}
		    				
		    			}
		    			// a.k.a. PostCSS "decl"
		    			else if(val instanceof less.tree.Rule) {
		    				container.append(process.rule(val));
		    			}
		    			else if(val instanceof less.tree.Comment) {
		    				container.append(process.comment(val));
		    			}
		    			// a.k.a. PostCSS "atrule"
		    			else if(val instanceof less.tree.Directive) {
		    				container.append(process.directive(val));
		    			}
		    			else if(val instanceof less.tree.Import) {
		    				container.append(process.directive(val));
		    			}
		    		});
		    	}
	    	}

	        return new Promise(function (resolve, reject) {

	        	cacheInput = cacheInput.toString();
	        	if(!cacheInput) {
	        		// TODO: explain the error
	        		reject(new CssSyntaxError(
	        			"No input is present"
	        		));
	        	}
	            render(cacheInput, opts, function(err, tree, evaldRoot, imports) {
					if(err) {
						// Build PostCSS error
						return reject(new CssSyntaxError(
							err.message
							, err.line || err.line === 0 ? err.line + 1 : undefined
							, err.column || err.column === 0 ? err.column + 1 : undefined
							, err.extract
							, err.filename
							, 'postcss-less-engine'
						));
					}
					try {
						// Not sure if this is the correct context or not?
						//context = tree.imports.context;
						context = {};
						// Convert Less AST to PostCSS AST
						convertImports(imports.contents);

						processRules(css, evaldRoot.rules);
						resolve();
					}
					catch(err) {
						return reject(new CssSyntaxError(
							err.message
							, err.line || err.line === 0 ? err.line + 1 : undefined
							, err.column || err.column === 0 ? err.column + 1 : undefined
							, err.extract
							, err.filename
							, 'postcss-less-engine'
						));
						//return reject(err);
					}
				});
	        });
	    };
	});
	plugin.parser = function(input) {
		cacheInput = input ? input : " ";
	    return new postcss.root();
	};

	return plugin;
}

module.exports = LessPlugin();