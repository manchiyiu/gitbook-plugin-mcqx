var jade = require('jade');
var path = require('path');
var fs = require('fs');

var checksum = require('checksum');
var marked = require('marked');

module.exports = {

    website: {
        assets: "./assets",
        css: [
            "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css",
            "mcqx.css"
        ],
        js: [
            "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js",
            "js.cookie.js",
            "mcqx.js"
        ]
    },

    blocks: {
        mcq: {
            blocks: ['title', 'o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7', 'o8', 'hint', 'message', 'incorrect'],
            process: function(blk) {

                var question = {
                    ans: blk.kwargs.ans.trim(),
                    maxattempts: blk.kwargs.maxattempts ? blk.kwargs.maxattempts : false,
                    random: blk.kwargs.random || false,
                    target: blk.kwargs.target ? blk.kwargs.target.trim() : false,
                    option: []
                };

                var alphabet = ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7', 'o8'];

                blk.blocks.forEach(function(item) {
                    if (item.body && alphabet.indexOf(item.name) >= 0)
                        question.option.push({
                            id: item.name,
                            body: item.body.trim()
                        });
                    else if (item.name === 'title')
                        question.title = marked(item.body.trim());
                    else
                        question[item.name] = item.body.trim();
                });

                question.count = blk.kwargs.count || question.option.length;
                question.id = checksum(JSON.stringify(question));

                var mcqView = (this.generator === 'website' ?
                    fs.readFileSync(path.resolve(__dirname, "./views/mcq.jade")) :
                    fs.readFileSync(path.resolve(__dirname, "./views/mcq_pdf.jade")));

                return '<div class="mcqx">' + jade.render(mcqView, {
                    question: question
                }) + '</div>';
            }
        }
    }
};
