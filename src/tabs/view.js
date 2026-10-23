/**
 * Front end of the tabs block: no dependencies.
 *
 * The server renders a working first state (first tab open). This script adds
 * switching, the keyboard (arrows, Home, End), the URL hash and, on small
 * screens, the accordion.
 */
( function () {
	'use strict';

	function children( element, className ) {
		return Array.prototype.filter.call( element.children, function ( child ) {
			return child.classList.contains( className );
		} );
	}

	function init( root ) {
		var list = children( root, 'semera-tabs__list' )[ 0 ];
		var holder = children( root, 'semera-tabs__panels' )[ 0 ];
		if ( ! list || ! holder ) {
			return;
		}

		var tabs = children( list, 'semera-tabs__tab' );
		var items = children( holder, 'semera-tabs__item' ).map( function ( item ) {
			return { toggle: children( item, 'semera-tabs__toggle' )[ 0 ], panel: children( item, 'semera-tabs__panel' )[ 0 ] };
		} );
		if ( ! tabs.length || tabs.length !== items.length ) {
			return;
		}

		var stacked = root.classList.contains( 'is-mobile-stacked' );
		var accordion = root.classList.contains( 'is-mobile-accordion' );
		var vertical = root.classList.contains( 'is-vertical' );
		var breakpoint = parseInt( root.getAttribute( 'data-breakpoint' ), 10 ) || 600;
		var query = window.matchMedia( '(max-width: ' + breakpoint + 'px)' );
		var mobile = false;
		var active = 0;

		function accordionMode() {
			return mobile && accordion;
		}

		function listIsVertical() {
			return mobile ? stacked : vertical;
		}

		function render() {
			var asAccordion = accordionMode();
			list.setAttribute( 'aria-orientation', listIsVertical() ? 'vertical' : 'horizontal' );

			items.forEach( function ( item, i ) {
				var open = i === active;
				tabs[ i ].setAttribute( 'aria-selected', open ? 'true' : 'false' );
				tabs[ i ].tabIndex = open ? 0 : -1;
				item.toggle.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
				item.panel.hidden = ! open;

				if ( asAccordion ) {
					item.panel.setAttribute( 'role', 'region' );
					item.panel.setAttribute( 'aria-labelledby', item.toggle.id );
					item.panel.removeAttribute( 'tabindex' );
				} else {
					item.panel.setAttribute( 'role', 'tabpanel' );
					item.panel.setAttribute( 'aria-labelledby', tabs[ i ].id );
					item.panel.tabIndex = 0;
				}
			} );
		}

		function writeHash( i ) {
			try {
				window.history.replaceState( null, '', '#' + items[ i ].panel.id );
			} catch ( e ) {}
		}

		function select( i, options ) {
			active = i;
			render();
			if ( options && options.focus ) {
				tabs[ i ].focus();
			}
			if ( options && options.hash && i >= 0 ) {
				writeHash( i );
			}
		}

		// Opens the tab that holds the element the URL hash points to.
		function fromHash( scroll ) {
			var id = window.location.hash.slice( 1 );
			if ( ! id ) {
				return;
			}
			try {
				id = decodeURIComponent( id );
			} catch ( e ) {}
			var target = document.getElementById( id );
			if ( ! target ) {
				return;
			}
			for ( var i = 0; i < items.length; i++ ) {
				if ( items[ i ].panel.contains( target ) ) {
					select( i );
					if ( scroll ) {
						target.scrollIntoView();
					}
					return;
				}
			}
		}

		function update() {
			mobile = query.matches;
			root.classList.toggle( 'is-mobile', mobile );
			if ( ! accordionMode() && active < 0 ) {
				active = 0;
			}
			render();
		}

		tabs.forEach( function ( tab, i ) {
			tab.addEventListener( 'click', function () {
				select( i, { hash: true } );
			} );
		} );

		items.forEach( function ( item, i ) {
			item.toggle.addEventListener( 'click', function () {
				select( active === i ? -1 : i, { hash: true } );
			} );
		} );

		list.addEventListener( 'keydown', function ( event ) {
			var index = tabs.indexOf( document.activeElement );
			if ( index < 0 || event.altKey || event.ctrlKey || event.metaKey ) {
				return;
			}
			var rtl = window.getComputedStyle( root ).direction === 'rtl';
			var next = listIsVertical() ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
			var previous = listIsVertical() ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
			var target;

			if ( event.key === next ) {
				target = ( index + 1 ) % tabs.length;
			} else if ( event.key === previous ) {
				target = ( index - 1 + tabs.length ) % tabs.length;
			} else if ( event.key === 'Home' ) {
				target = 0;
			} else if ( event.key === 'End' ) {
				target = tabs.length - 1;
			} else {
				return;
			}

			event.preventDefault();
			select( target, { focus: true, hash: true } );
		} );

		if ( query.addEventListener ) {
			query.addEventListener( 'change', update );
		} else {
			query.addListener( update );
		}
		window.addEventListener( 'hashchange', function () {
			fromHash( true );
		} );

		update();
		fromHash( true );
	}

	function start() {
		Array.prototype.forEach.call( document.querySelectorAll( '.semera-tabs' ), init );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', start );
	} else {
		start();
	}
} )();
