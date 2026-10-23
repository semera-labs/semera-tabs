<?php
namespace Semera\Tabs;

defined( 'ABSPATH' ) || exit;

/**
 * Server-side markup of the two blocks.
 *
 * Both blocks are saved as bare inner-block markup and rendered here, so the
 * markup can change without block deprecations. A tab renders its own panel
 * (inner blocks first, then this callback), the tabs block collects what its
 * tabs reported and puts the tab list in front of them.
 *
 * The edit-side counterpart of the CSS variables and classes is
 * src/tabs/attributes.js.
 */
final class Tabs {

	/** Maps a tabs block attribute to the CSS custom property that carries it. */
	private const COLORS = array(
		'tabColor'            => '--semera-tabs-color',
		'tabBackground'       => '--semera-tabs-bg',
		'activeTabColor'      => '--semera-tabs-active-color',
		'activeTabBackground' => '--semera-tabs-active-bg',
		'accentColor'         => '--semera-tabs-accent',
	);

	private const PIXELS = array(
		'tabPaddingX'  => '--semera-tabs-pad-x',
		'tabPaddingY'  => '--semera-tabs-pad-y',
		'tabRadius'    => '--semera-tabs-radius',
		'tabGap'       => '--semera-tabs-gap',
		'iconSize'     => '--semera-tabs-icon-size',
		'panelPadding' => '--semera-tabs-panel-pad',
	);

	private const KEYWORDS = array(
		'tabFontSize'   => '--semera-tabs-font-size',
		'tabFontWeight' => '--semera-tabs-font-weight',
		'tabTransform'  => '--semera-tabs-transform',
	);

	/** @var \SplObjectStorage|null WP_Block of a tabs block => id used in element ids. */
	private static $uids = null;

	/** @var array<string,int> Number of tabs already rendered per tabs block id. */
	private static $counts = array();

	/** @var array<string,array> What each tab reported, per tabs block id. */
	private static $tabs = array();

	/** @var array<string,bool> Panel ids used on this page. */
	private static $used = array();

	/**
	 * Hands every tab the id of the tabs block it sits in (context cannot carry
	 * values that are not block attributes, so this goes through the filter).
	 */
	public static function provide_context( $context, $parsed_block, $parent_block ) {
		if ( $parent_block instanceof \WP_Block && 'semera-tabs/tabs' === $parent_block->name ) {
			$context['semera-tabs/uid'] = self::uid( $parent_block );
		}
		return $context;
	}

	private static function uid( \WP_Block $block ): string {
		if ( null === self::$uids ) {
			self::$uids = new \SplObjectStorage();
		}
		if ( ! isset( self::$uids[ $block ] ) ) {
			self::$uids[ $block ] = wp_unique_prefixed_id( 'semera-tabs-' );
		}
		return self::$uids[ $block ];
	}

	private static function unique_id( string $base ): string {
		$id = $base;
		for ( $n = 2; isset( self::$used[ $id ] ); $n++ ) {
			$id = $base . '-' . $n;
		}
		self::$used[ $id ] = true;
		return $id;
	}

	/** Tab block: <div item> toggle (accordion) + panel. */
	public static function render_tab( array $attributes, string $content, \WP_Block $block ): string {
		$uid   = $block->context['semera-tabs/uid'] ?? 'semera-tabs-0';
		$index = isset( self::$counts[ $uid ] ) ? self::$counts[ $uid ] + 1 : 0;
		self::$counts[ $uid ] = $index;

		$title = trim( wp_strip_all_tags( $attributes['title'] ?? '' ) );
		if ( '' === $title ) {
			/* translators: %d: position of the tab, starting at 1. */
			$title = sprintf( __( 'Tab %d', 'semera-tabs' ), $index + 1 );
		}

		$base = preg_replace( '/[^A-Za-z0-9_.:-]+/', '-', trim( $attributes['tabId'] ?? '' ) );
		if ( '' === trim( (string) $base, '-' ) ) {
			$base = 'tab-' . sanitize_title( html_entity_decode( $title ) );
		}
		if ( 'tab-' === $base ) {
			$base = 'tab-' . ( $index + 1 );
		}
		$panel_id = self::unique_id( $base );
		$active   = 0 === $index;

		$icon = Icons::render( (string) ( $attributes['icon'] ?? '' ) );

		self::$tabs[ $uid ][] = array(
			'id'    => $panel_id,
			'title' => $title,
			'icon'  => $icon,
		);

		$label = $icon . '<span class="semera-tabs__label">' . esc_html( $title ) . '</span>';

		return sprintf(
			'<div %1$s><div class="semera-tabs__heading">%2$s</div>'
			. '<button type="button" class="semera-tabs__toggle" id="%3$s-toggle" aria-controls="%3$s" aria-expanded="%4$s">%2$s<span class="semera-tabs__chevron" aria-hidden="true"></span></button>'
			. '<div class="semera-tabs__panel is-layout-flow" id="%3$s" role="tabpanel" aria-labelledby="%3$s-tab"%5$s>%6$s</div></div>',
			get_block_wrapper_attributes( array( 'class' => 'semera-tabs__item' ) ),
			$label,
			esc_attr( $panel_id ),
			$active ? 'true' : 'false',
			$active ? '' : ' hidden',
			$content
		);
	}

	/** Tabs block: tab list + the panels the tabs rendered. */
	public static function render_tabs( array $attributes, string $content, \WP_Block $block ): string {
		$uid  = self::uid( $block );
		$tabs = self::$tabs[ $uid ] ?? array();
		unset( self::$tabs[ $uid ], self::$counts[ $uid ] );

		if ( ! $tabs ) {
			return '';
		}

		$vertical = 'vertical' === ( $attributes['orientation'] ?? '' );
		$buttons  = '';
		foreach ( $tabs as $i => $tab ) {
			$buttons .= sprintf(
				'<button type="button" class="semera-tabs__tab" role="tab" id="%1$s-tab" aria-controls="%1$s" aria-selected="%2$s" tabindex="%3$s">%4$s<span class="semera-tabs__label">%5$s</span></button>',
				esc_attr( $tab['id'] ),
				0 === $i ? 'true' : 'false',
				0 === $i ? '0' : '-1',
				$tab['icon'],
				esc_html( $tab['title'] )
			);
		}

		$wrapper = get_block_wrapper_attributes(
			array(
				'class'           => self::classes( $attributes ),
				'style'           => self::style( $attributes ),
				'data-breakpoint' => (string) self::number( $attributes['mobileBreakpoint'] ?? 600, 600 ),
			)
		);

		return sprintf(
			'<div %1$s><div class="semera-tabs__list" role="tablist" aria-orientation="%2$s">%3$s</div><div class="semera-tabs__panels">%4$s</div></div>',
			$wrapper,
			$vertical ? 'vertical' : 'horizontal',
			$buttons,
			$content
		);
	}

	private static function classes( array $attributes ): string {
		$classes = array( 'semera-tabs' );

		if ( 'vertical' === ( $attributes['orientation'] ?? '' ) ) {
			$classes[] = 'is-vertical';
		}
		$align = $attributes['tabsAlign'] ?? '';
		if ( in_array( $align, array( 'center', 'end', 'stretch' ), true ) ) {
			$classes[] = 'is-tabs-' . $align;
		}
		$icons = $attributes['iconPosition'] ?? '';
		if ( in_array( $icons, array( 'top', 'end' ), true ) ) {
			$classes[] = 'has-icons-' . $icons;
		}
		$mobile = $attributes['mobileLayout'] ?? 'accordion';
		if ( in_array( $mobile, array( 'stacked', 'accordion' ), true ) ) {
			$classes[] = 'is-mobile-' . $mobile;
		}

		return implode( ' ', $classes );
	}

	private static function style( array $attributes ): string {
		$css = '';

		foreach ( self::COLORS + self::KEYWORDS as $attribute => $property ) {
			$value = self::css_value( $attributes[ $attribute ] ?? '' );
			if ( '' !== $value ) {
				$css .= $property . ':' . $value . ';';
			}
		}
		foreach ( self::PIXELS as $attribute => $property ) {
			if ( isset( $attributes[ $attribute ] ) && is_numeric( $attributes[ $attribute ] ) ) {
				$css .= $property . ':' . (float) $attributes[ $attribute ] . 'px;';
			}
		}

		return $css;
	}

	/** Colors, sizes and keywords only: no declarations can be smuggled in. */
	private static function css_value( $value ): string {
		$value = is_string( $value ) ? trim( $value ) : '';
		if ( '' === $value || ! preg_match( '/^[#a-z0-9.,()%\s\/+*-]+$/i', $value ) || false !== stripos( $value, 'url(' ) || false !== stripos( $value, 'expression' ) ) {
			return '';
		}
		return $value;
	}

	private static function number( $value, int $fallback ): int {
		return is_numeric( $value ) && $value >= 0 ? (int) $value : $fallback;
	}
}
