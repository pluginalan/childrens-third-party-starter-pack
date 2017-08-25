define( function() {
    "use strict"

    var domUtils = {
        addStylesheet: function() {
            var stylesheet  = document.createElement( "link" )
            stylesheet.rel  = "stylesheet"
            stylesheet.type = "text/css"
            stylesheet.href = "style.css"
            stylesheet.media = "all"
            document.getElementsByTagName( "head" )[0].appendChild( stylesheet )
        },

        addTitle: function( text )
        {
            var element = document.createElement( "h1" )
            element.setAttribute( "class", "title" )
            element.appendChild( document.createTextNode( text ) )
            this.addToBody( element )
        },

        addBackButton: function()
        {
            var back = document.createElement( "button" )
            back.setAttribute( "class", "back" )
            back.appendChild( document.createTextNode( "< Back" ) )
            this.addToBody( back )
            return back
        },

        addToBody: function( element )
        {
            document.getElementsByTagName( "body" )[0].appendChild( element )
        },

        addLine: function()
        {
            var line = document.createElement( "div" )
            line.setAttribute( "class", "line" )
            this.addToBody( line )
        },

        addTextElement: function( type, text )
        {
            var element = document.createElement( type )
            element.appendChild( document.createTextNode( text ) )
            this.addToBody( element )
        },

        addButton: function( title, key )
        {
            var element = document.createElement( "button" )
            element.appendChild( document.createTextNode( title ) )
            this.addToBody( element )
            return element
        }
    }

    return domUtils
})