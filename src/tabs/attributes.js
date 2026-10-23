/**
 * Class names and CSS variables of the tabs block, as the editor builds them.
 * includes/Tabs.php does the same for the front end, keep both in step.
 */
const VARIABLES = {
	tabColor: '--semera-tabs-color',
	tabBackground: '--semera-tabs-bg',
	activeTabColor: '--semera-tabs-active-color',
	activeTabBackground: '--semera-tabs-active-bg',
	accentColor: '--semera-tabs-accent',
	tabFontSize: '--semera-tabs-font-size',
	tabFontWeight: '--semera-tabs-font-weight',
	tabTransform: '--semera-tabs-transform',
};

const PIXELS = {
	tabPaddingX: '--semera-tabs-pad-x',
	tabPaddingY: '--semera-tabs-pad-y',
	tabRadius: '--semera-tabs-radius',
	tabGap: '--semera-tabs-gap',
	iconSize: '--semera-tabs-icon-size',
	panelPadding: '--semera-tabs-panel-pad',
};

export function getClassName( attributes ) {
	const { orientation, tabsAlign, iconPosition, mobileLayout } = attributes;
	return [
		'semera-tabs',
		orientation === 'vertical' && 'is-vertical',
		[ 'center', 'end', 'stretch' ].includes( tabsAlign ) && `is-tabs-${ tabsAlign }`,
		[ 'top', 'end' ].includes( iconPosition ) && `has-icons-${ iconPosition }`,
		[ 'stacked', 'accordion' ].includes( mobileLayout ) && `is-mobile-${ mobileLayout }`,
	]
		.filter( Boolean )
		.join( ' ' );
}

export function getStyle( attributes ) {
	const style = {};
	for ( const [ attribute, property ] of Object.entries( VARIABLES ) ) {
		if ( attributes[ attribute ] ) {
			style[ property ] = attributes[ attribute ];
		}
	}
	for ( const [ attribute, property ] of Object.entries( PIXELS ) ) {
		if ( typeof attributes[ attribute ] === 'number' ) {
			style[ property ] = `${ attributes[ attribute ] }px`;
		}
	}
	return style;
}
