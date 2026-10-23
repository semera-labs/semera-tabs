<?php
namespace Semera\Tabs;

defined( 'ABSPATH' ) || exit;

final class Plugin {

	public static function boot(): void {
		add_action( 'init', array( self::class, 'load_textdomain' ), 1 );
		add_action( 'init', array( self::class, 'register_blocks' ) );
		add_filter( 'render_block_context', array( Tabs::class, 'provide_context' ), 10, 3 );
	}

	public static function load_textdomain(): void {
		load_plugin_textdomain( 'semera-tabs', false, dirname( plugin_basename( SEMERA_TABS_FILE ) ) . '/languages' );
	}

	public static function register_blocks(): void {
		if ( ! file_exists( SEMERA_TABS_DIR . 'build/tabs/block.json' ) ) {
			// Run `npm install && npm run build` in a git checkout; release zips contain the build.
			return;
		}

		register_block_type( SEMERA_TABS_DIR . 'build/tab', array( 'render_callback' => array( Tabs::class, 'render_tab' ) ) );
		register_block_type( SEMERA_TABS_DIR . 'build/tabs', array( 'render_callback' => array( Tabs::class, 'render_tabs' ) ) );

		wp_set_script_translations(
			generate_block_asset_handle( 'semera-tabs/tabs', 'editorScript' ),
			'semera-tabs',
			SEMERA_TABS_DIR . 'languages'
		);
	}
}
