import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useContext } from '@wordpress/element';
import { ActiveTabContext } from '../tabs/context';
import TabSettings from './settings';

export default function Edit( { clientId } ) {
	const activeTab = useContext( ActiveTabContext );
	const hidden = activeTab !== null && activeTab !== clientId;

	const blockProps = useBlockProps( {
		className: 'semera-tabs__panel is-layout-flow',
		style: hidden ? { display: 'none' } : undefined,
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, { template: [ [ 'core/paragraph' ] ] } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Tab', 'semera-tabs' ) }>
					<TabSettings clientId={ clientId } />
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
