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
        'sling-ui-dev.js': /^src/
      order:
        before: ['src/scripts/sling-ui.coffee']

    stylesheets:
      joinTo:
        'sling-ui.css': /^src/
      
    templates:
      joinTo: 
        '.compile-jade' : /^src/ # dirty hack for Jade compiling.

  plugins:
    jade:
      pretty: yes # Adds pretty-indentation whitespaces to output (false by default)
    jade_angular:
      single_file: false
      angular_module:
        namespace: 'sling.ui'
        predefined: true
      output_directory: '/'
      locals: {}
    afterBrunch: [ 
      "groundskeeper < dist/sling-ui-dev.js > dist/sling-ui.js"
    ]
  minify: true