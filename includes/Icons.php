<?php
namespace Semera\Tabs;

defined( 'ABSPATH' ) || exit;

/**
 * The tab icon set: icons/icons.json maps a slug to the inner markup of a 24x24
 * stroke icon. The editor imports the same file, so both sides stay in sync.
 */
final class Icons {

	private static $icons = null;

	public static function all(): array {
		if ( null === self::$icons ) {
			$json        = file_get_contents( SEMERA_TABS_DIR . 'icons/icons.json' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$decoded     = $json ? json_decode( $json, true ) : null;
			self::$icons = is_array( $decoded ) ? $decoded : array();
		}
		return self::$icons;
	}

	/** Returns the <span><svg> for a slug, or '' for no or an unknown icon. */
	public static function render( string $slug ): string {
		$icons = self::all();
		if ( '' === $slug || ! isset( $icons[ $slug ] ) ) {
			return '';
		}

		return '<span class="semera-tabs__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false">'
			. $icons[ $slug ]
			. '</svg></span>';
	}
}
