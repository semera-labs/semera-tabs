<?php
/**
 * Plugin Name:       Semera Tabs
 * Description:       A tabs block for the block editor: icons, any blocks inside, accordion on mobile, accessible, no jQuery.
 * Version:           0.1.1
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            semera
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       semera-tabs
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

define( 'SEMERA_TABS_VERSION', '0.1.1' );
define( 'SEMERA_TABS_FILE', __FILE__ );
define( 'SEMERA_TABS_DIR', plugin_dir_path( __FILE__ ) );

require_once SEMERA_TABS_DIR . 'includes/Icons.php';
require_once SEMERA_TABS_DIR . 'includes/Tabs.php';
require_once SEMERA_TABS_DIR . 'includes/Plugin.php';

\Semera\Tabs\Plugin::boot();
