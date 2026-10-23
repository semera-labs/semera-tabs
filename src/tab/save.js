import { InnerBlocks } from '@wordpress/block-editor';

// Rendered by includes/Tabs.php, so only the inner blocks are stored.
export default function save() {
	return <InnerBlocks.Content />;
}
