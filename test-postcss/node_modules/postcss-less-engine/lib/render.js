var less = require('less');

module.exports = function(ParseTree, transformTree) {
    var render = function (input, options, callback) {
        
        less.parse(input, options, function(err, root, imports, options) {
            if (err) { return callback(err); }

            var tree, evaldRoot;
            try {
                tree = new ParseTree(root, imports);
                evaldRoot = transformTree(tree.root, options);
            }
            catch (err) { return callback(err); }

            callback(null, tree, evaldRoot, imports);
        });
        
    };

    return render;
};
