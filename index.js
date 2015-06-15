var Metalsmith  = require('metalsmith'),
    path        = require('path'),
    markdown    = require('metalsmith-markdown'),
    templates   = require('metalsmith-templates'),
    collections = require('metalsmith-collections'),
    permalinks  = require('metalsmith-permalinks'),
    gist        = require('metalsmith-gist'),
    drafts      = require('metalsmith-drafts'),
    tags        = require('metalsmith-tags'),
    sass        = require('metalsmith-sass'),
    pagination  = require('metalsmith-pagination'),
    excerpts    = require('metalsmith-excerpts'),

    Handlebars  = require('handlebars'),
    moment      = require('moment'),
    fs          = require('fs'),
    config      = require('./config.json'),

    baseUrl     = '';

Metalsmith(__dirname)

    .metadata(config.metadata)

    .use(partials({
        directory: 'templates/partials/'
    }))

    .use(drafts())
    .use(collections({
        //pages: {
            //pattern: 'content/pages/*.md'
        //},
        posts: {
            pattern: 'content/posts/*.md',
            sortBy: 'date',
            reverse: true
        }
    }))

    .use(findTemplate({
        pattern: 'posts',
        templateName: 'post.hbt'
    }))

    .use(markdown())

    .use(permalinks({
        pattern: ':collection/:title'
    }))

    .use(pagination({
        'collections.posts': {
            perPage: 5,
            template: 'index.hbt',
            first: 'index.html',
            path: ':num/index.html'
        }
    }))

    //.use(gist())
    
    .use(tags({
        handle: 'tags',
        template: 'tags.hbt',
        path: 'tags/:tag.html',
        pathPage: 'tags/:tag/:num/index.html',
        perPage: 1,
        sortBy: 'title',
        reverse: true
    }))

    .use(sass({
        outputStyle: 'compressed'
    }))

    .use(excerpts())

    .use(templates('handlebars'))

    .destination('./build')

    .build(function(err, files) {
        var message = err ? err : 'Build complete';
        console.log(message);
    });


/*
 * Handlebars helpers
 */
    
Handlebars.registerHelper('baseUrl', function() {
  return baseUrl;
});

Handlebars.registerHelper('dateFormat', function( context ) {
  return moment(context).format("MMMM DD, YYYY");
});

Handlebars.registerHelper('dateGMT', function( context ) {
  context = context === 'new' ? new Date() : context;
  return context.toGMTString();
});

// helpers para marcar a página corrente
Handlebars.registerHelper('currentPage', function( current, page ) {
  return current === page ? 'current' : '';
});

function findTemplate(config) {
    var pattern = new RegExp(config.pattern);
    return function(files, metalsmith, done) {
        for (var file in files) {
            if (pattern.test(file)) {
                var _f = files[file];
                if (!_f.template) {
                    _f.template = config.templateName;
                }
            }
        }
        done();
    };
}


// Make partials dinamically
function partials(options) {
    return function(files, metalsmith, done) {
        fs.readdir(path.resolve(options.directory), function(err, files) {
            if(err) throw err;
            files.forEach(function(file){
                var templateName = file.split('.').shift();
                var _path = path.resolve(options.directory, file);
                var partialContents = fs.readFileSync(_path).toString('utf8');
                Handlebars.registerPartial(templateName, partialContents);
            });
            done();
        });
    };
}

