import { __ } from '@wordpress/i18n';
import { TextControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { IconPicker } from '../tabs/icons';

/** Icon and URL id of one tab; used in the tab's own sidebar and for the active tab of the tabs block. */
export default function TabSettings( { clientId } ) {
	const attributes = useSelect( ( select ) => select( blockEditorStore ).getBlockAttributes( clientId ), [ clientId ] );
	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const update = ( values ) => updateBlockAttributes( clientId, values );

	if ( ! attributes ) {
		return null;
	}

	return (
		<>
			<IconPicker value={ attributes.icon } onChange={ ( icon ) => update( { icon } ) } />
			<TextControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				className="semera-tabs-tab-id"
				label={ __( 'Tab ID', 'semera-tabs' ) }
				help={ __( 'Used in the URL after # to link to this tab. Leave empty to use the title.', 'semera-tabs' ) }
				value={ attributes.tabId }
				onChange={ ( tabId ) => update( { tabId } ) }
			/>
		</>
	);
}
