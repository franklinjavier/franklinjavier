var Metalsmith  = require('metalsmith'),
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
    browserSync = require('metalsmith-browser-sync'),

    path        = require('path'),
    exec        = require('child_process').exec,
    Handlebars  = require('handlebars'),
    moment      = require('moment'),
    fs          = require('fs'),
    config      = require('./config.json');

Metalsmith(__dirname)

    .metadata(config)

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
        templateName: 'post.hbs'
    }))

    .use(markdown())

    .use(permalinks({
        pattern: ':collection/:title'
    }))

    .use(pagination({
        'collections.posts': {
            perPage: 5,
            template: 'index.hbs',
            first: 'index.html',
            path: 'posts/:num/index.html'
        }
    }))

    //.use(gist())
    
    .use(tags({
        handle: 'tags',
        path: 'tags/:tag.html',
        template: 'tags.hbs',
        pathPage: 'tags/:tag/:num/index.html',
        perPage: 2,
        sortBy: 'title',
        reverse: true
    }))

    .use(sass({
        outputStyle: 'compressed'
    }))

    .use(excerpts())

    .use(templates('handlebars'))

    .destination('./build')

   // .use(browserSync({
   //   server: './build/',
   //   open: false,
   //   ghostMode: {
   //       clicks: true,
   //       location: true,
   //       forms: true,
   //       scroll: true
   //   },
   //   files: [
   //       'src/**/*.md', 
   //       'src/**/*.scss', 
   //       'templates/**/*.hbs'
   //   ]
   // }))

    .build(function(err, files) {
        var message = err ? err : 'Build complete';
        console.log(message);
    });


/*
 * Handlebars helpers
 */
    
moment.locale('pt');

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

Handlebars.registerHelper('currentPage', function( path ) {
  console.log(path);
  return current === page ? 'current' : '';
});

Handlebars.registerHelper('debug', function( node ) {
  console.log(node);
  return;
});

Handlebars.registerHelper('isHome', function( path ) {
  if ( path === 'index.html' ) 
      this.home = true;

  return path === 'index.html' ? 'home' : '';
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
                return file.type ? _.extend(file,{template:file.type+".hbs"},_.object(["is"+file.type],[true])) : file;
            });
            done();
        });
    };
}

