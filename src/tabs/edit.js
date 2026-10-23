import { __, sprintf } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	useSettings,
	InspectorControls,
	BlockControls,
	RichText,
	FontSizePicker,
	PanelColorSettings,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { PanelBody, RangeControl, SelectControl, ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { getClassName, getStyle } from './attributes';
import { ActiveTabContext } from './context';
import { TabIcon } from './icons';
import TabSettings from '../tab/settings';

const ALLOWED_BLOCKS = [ 'semera-tabs/tab' ];

/** Range control that stores a pixel number, or nothing to fall back to the CSS default. */
function Pixels( { label, attribute, attributes, setAttributes, max = 48, fallback } ) {
	return (
		<RangeControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label={ label }
			value={ attributes[ attribute ] }
			onChange={ ( value ) => setAttributes( { [ attribute ]: value } ) }
			min={ 0 }
			max={ max }
			allowReset
			initialPosition={ fallback }
		/>
	);
}

function tabTitle( number ) {
	/* translators: %d: position of the tab, starting at 1. */
	return sprintf( __( 'Tab %d', 'semera-tabs' ), number );
}

export default function Edit( { clientId, attributes, setAttributes } ) {
	const [ fontSizes ] = useSettings( 'typography.fontSizes' );
	const [ active, setActive ] = useState( 0 );

	const { tabs, selectedTab } = useSelect(
		( select ) => {
			const store = select( blockEditorStore );
			const selected = store.getSelectedBlockClientId();
			const children = store.getBlocks( clientId );
			const path = selected ? [ selected, ...store.getBlockParents( selected ) ] : [];
			return {
				tabs: children,
				selectedTab: children.findIndex( ( tab ) => path.includes( tab.clientId ) ),
			};
		},
		[ clientId ]
	);
	const { insertBlock, removeBlock, moveBlockToPosition, updateBlockAttributes } = useDispatch( blockEditorStore );

	// Selecting something inside a tab (also through the list view) shows that tab.
	useEffect( () => {
		if ( selectedTab >= 0 ) {
			setActive( selectedTab );
		}
	}, [ selectedTab ] );

	const current = Math.max( 0, Math.min( active, tabs.length - 1 ) );
	const currentTab = tabs[ current ];

	const addTab = () => {
		const block = createBlock( 'semera-tabs/tab', { title: tabTitle( tabs.length + 1 ) }, [ createBlock( 'core/paragraph' ) ] );
		insertBlock( block, tabs.length, clientId, false );
		setActive( tabs.length );
	};
	const removeTab = () => {
		removeBlock( currentTab.clientId, false );
		setActive( Math.max( 0, current - 1 ) );
	};
	const moveTab = ( to ) => {
		moveBlockToPosition( currentTab.clientId, clientId, clientId, to );
		setActive( to );
	};

	const template = useMemo(
		() => [ 1, 2, 3 ].map( ( n ) => [ 'semera-tabs/tab', { title: tabTitle( n ) }, [ [ 'core/paragraph' ] ] ] ),
		[]
	);

	const blockProps = useBlockProps( { className: getClassName( attributes ), style: getStyle( attributes ) } );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'semera-tabs__panels' },
		{ allowedBlocks: ALLOWED_BLOCKS, template, renderAppender: false }
	);

	const props = { attributes, setAttributes };
	const color = ( attribute, label ) => ( {
		value: attributes[ attribute ],
		onChange: ( value ) => setAttributes( { [ attribute ]: value } ),
		label,
	} );
	const select = ( attribute, label, options ) => (
		<SelectControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label={ label }
			value={ attributes[ attribute ] || '' }
			options={ options.map( ( [ value, text ] ) => ( { value, label: text } ) ) }
			onChange={ ( value ) => setAttributes( { [ attribute ]: value } ) }
		/>
	);

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton icon="plus-alt2" label={ __( 'Add tab', 'semera-tabs' ) } onClick={ addTab } />
					<ToolbarButton
						icon="arrow-left-alt2"
						label={ __( 'Move tab earlier', 'semera-tabs' ) }
						disabled={ current < 1 }
						onClick={ () => moveTab( current - 1 ) }
					/>
					<ToolbarButton
						icon="arrow-right-alt2"
						label={ __( 'Move tab later', 'semera-tabs' ) }
						disabled={ current >= tabs.length - 1 }
						onClick={ () => moveTab( current + 1 ) }
					/>
					<ToolbarButton
						icon="trash"
						label={ __( 'Remove tab', 'semera-tabs' ) }
						disabled={ tabs.length < 2 }
						onClick={ removeTab }
					/>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				{ currentTab && (
					<PanelBody title={ __( 'Selected tab', 'semera-tabs' ) }>
						<TabSettings clientId={ currentTab.clientId } />
					</PanelBody>
				) }
				<PanelBody title={ __( 'Layout', 'semera-tabs' ) } initialOpen={ false }>
					{ select( 'orientation', __( 'Tabs are placed', 'semera-tabs' ), [
						[ 'horizontal', __( 'Above the content', 'semera-tabs' ) ],
						[ 'vertical', __( 'Beside the content', 'semera-tabs' ) ],
					] ) }
					{ select( 'tabsAlign', __( 'Tab alignment', 'semera-tabs' ), [
						[ 'start', __( 'Start', 'semera-tabs' ) ],
						[ 'center', __( 'Center', 'semera-tabs' ) ],
						[ 'end', __( 'End', 'semera-tabs' ) ],
						[ 'stretch', __( 'Fill the width', 'semera-tabs' ) ],
					] ) }
					<Pixels { ...props } label={ __( 'Space between tabs', 'semera-tabs' ) } attribute="tabGap" max={ 40 } fallback={ 0 } />
					<Pixels { ...props } label={ __( 'Panel padding', 'semera-tabs' ) } attribute="panelPadding" max={ 80 } fallback={ 20 } />
				</PanelBody>
				<PanelBody title={ __( 'Tab buttons', 'semera-tabs' ) } initialOpen={ false }>
					<Pixels { ...props } label={ __( 'Horizontal padding', 'semera-tabs' ) } attribute="tabPaddingX" fallback={ 20 } />
					<Pixels { ...props } label={ __( 'Vertical padding', 'semera-tabs' ) } attribute="tabPaddingY" fallback={ 12 } />
					<Pixels { ...props } label={ __( 'Corner radius', 'semera-tabs' ) } attribute="tabRadius" max={ 50 } fallback={ 0 } />
					<FontSizePicker
						__next40pxDefaultSize
						fontSizes={ fontSizes }
						value={ attributes.tabFontSize }
						onChange={ ( tabFontSize ) => setAttributes( { tabFontSize } ) }
						withReset
					/>
					{ select( 'tabFontWeight', __( 'Font weight', 'semera-tabs' ), [
						[ '', __( 'Default', 'semera-tabs' ) ],
						[ '400', __( 'Normal', 'semera-tabs' ) ],
						[ '500', __( 'Medium', 'semera-tabs' ) ],
						[ '600', __( 'Semi-bold', 'semera-tabs' ) ],
						[ '700', __( 'Bold', 'semera-tabs' ) ],
					] ) }
					{ select( 'tabTransform', __( 'Letter case', 'semera-tabs' ), [
						[ '', __( 'Default', 'semera-tabs' ) ],
						[ 'uppercase', __( 'Uppercase', 'semera-tabs' ) ],
						[ 'capitalize', __( 'Capitalize', 'semera-tabs' ) ],
						[ 'lowercase', __( 'Lowercase', 'semera-tabs' ) ],
						[ 'none', __( 'As typed', 'semera-tabs' ) ],
					] ) }
				</PanelBody>
				<PanelBody title={ __( 'Icons', 'semera-tabs' ) } initialOpen={ false }>
					{ select( 'iconPosition', __( 'Icon position', 'semera-tabs' ), [
						[ 'start', __( 'Before the title', 'semera-tabs' ) ],
						[ 'top', __( 'Above the title', 'semera-tabs' ) ],
						[ 'end', __( 'After the title', 'semera-tabs' ) ],
					] ) }
					<Pixels { ...props } label={ __( 'Icon size', 'semera-tabs' ) } attribute="iconSize" max={ 64 } fallback={ 20 } />
				</PanelBody>
				<PanelBody title={ __( 'Small screens', 'semera-tabs' ) } initialOpen={ false }>
					{ select( 'mobileLayout', __( 'Layout', 'semera-tabs' ), [
						[ 'accordion', __( 'Accordion', 'semera-tabs' ) ],
						[ 'stacked', __( 'Tabs stacked on top of each other', 'semera-tabs' ) ],
						[ 'tabs', __( 'Tabs stay as they are', 'semera-tabs' ) ],
					] ) }
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Small screen up to (px)', 'semera-tabs' ) }
						help={ __( 'Screens up to this width get the layout above.', 'semera-tabs' ) }
						value={ attributes.mobileBreakpoint }
						onChange={ ( mobileBreakpoint ) => setAttributes( { mobileBreakpoint } ) }
						min={ 320 }
						max={ 1200 }
						step={ 10 }
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="color">
				<PanelColorSettings
					__experimentalIsRenderedInSidebar
					title={ __( 'Tab colors', 'semera-tabs' ) }
					initialOpen={ false }
					colorSettings={ [
						color( 'tabColor', __( 'Tab text', 'semera-tabs' ) ),
						color( 'tabBackground', __( 'Tab background', 'semera-tabs' ) ),
						color( 'activeTabColor', __( 'Active tab text', 'semera-tabs' ) ),
						color( 'activeTabBackground', __( 'Active tab background', 'semera-tabs' ) ),
						color( 'accentColor', __( 'Accent (lines and borders)', 'semera-tabs' ) ),
					] }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="semera-tabs__list" role="tablist" aria-orientation={ attributes.orientation }>
					{ tabs.map( ( tab, i ) => (
						// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
						<div
							key={ tab.clientId }
							className="semera-tabs__tab"
							role="tab"
							aria-selected={ i === current }
							onClick={ () => setActive( i ) }
						>
							<TabIcon slug={ tab.attributes.icon } />
							<RichText
								tagName="span"
								className="semera-tabs__label"
								value={ tab.attributes.title }
								onChange={ ( title ) => updateBlockAttributes( tab.clientId, { title } ) }
								onFocus={ () => setActive( i ) }
								placeholder={ tabTitle( i + 1 ) }
								aria-label={ __( 'Tab title', 'semera-tabs' ) }
								allowedFormats={ [] }
								disableLineBreaks
							/>
						</div>
					) ) }
					<button type="button" className="semera-tabs__add" onClick={ addTab } aria-label={ __( 'Add tab', 'semera-tabs' ) }>
						+
					</button>
				</div>
				<ActiveTabContext.Provider value={ currentTab ? currentTab.clientId : null }>
					<div { ...innerBlocksProps } />
				</ActiveTabContext.Provider>
			</div>
		</>
	);
}
