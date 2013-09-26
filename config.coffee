exports.config =
  # See http://brunch.readthedocs.org/en/latest/config.html for documentation.
  modules:
    definition: false
    wrapper: false 
  sourceMaps: false
  paths:
      public: 'dist'
      watched: ['src']
      jadeCompileTrigger: '.compile-jade'
  files:
    javascripts:
      joinTo:
        'sling-ui.js': /^src/
      order:
        before: ['src/scripts/aingular.coffee']

    stylesheets:
      joinTo:
        'sling-ui.css': /^src/
      
    templates:
      joinTo: 
        '.compile-jade' : /^src/ # dirty hack for Jade compiling.

  plugins:
    jade:
      pretty: yes # Adds pretty-indentation whitespaces to output (false by default)
      doctype: "xml"
    jade_angular:
      single_file: true
      single_file_name:'sling-ui.tpls.js'
  minify: true