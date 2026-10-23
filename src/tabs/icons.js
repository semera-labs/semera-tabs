import { __ } from '@wordpress/i18n';
import { Button, Popover, SearchControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import icons from '../../icons/icons.json';

export function TabIcon( { slug } ) {
	if ( ! icons[ slug ] ) {
		return null;
	}
	return (
		<span className="semera-tabs__icon" aria-hidden="true">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
				focusable="false"
				dangerouslySetInnerHTML={ { __html: icons[ slug ] } }
			/>
		</span>
	);
}

export function IconPicker( { value, onChange } ) {
	const [ open, setOpen ] = useState( false );
	const [ search, setSearch ] = useState( '' );
	const slugs = Object.keys( icons ).filter( ( slug ) => slug.includes( search.trim().toLowerCase() ) );

	return (
		<div className="semera-tabs-icon-picker">
			<div className="semera-tabs-icon-picker__buttons">
				<Button variant="secondary" onClick={ () => setOpen( ! open ) } aria-expanded={ open }>
					{ value ? <TabIcon slug={ value } /> : null }
					{ value ? value : __( 'Choose icon', 'semera-tabs' ) }
				</Button>
				{ value ? (
					<Button variant="tertiary" isDestructive onClick={ () => onChange( '' ) }>
						{ __( 'Remove icon', 'semera-tabs' ) }
					</Button>
				) : null }
			</div>
			{ open && (
				<Popover placement="left-start" onClose={ () => setOpen( false ) } focusOnMount="firstElement">
					<div className="semera-tabs-icon-grid">
						<SearchControl
							__nextHasNoMarginBottom
							label={ __( 'Search icons', 'semera-tabs' ) }
							value={ search }
							onChange={ setSearch }
						/>
						<div className="semera-tabs-icon-grid__icons">
							{ slugs.map( ( slug ) => (
								<Button
									key={ slug }
									label={ slug }
									isPressed={ slug === value }
									onClick={ () => {
										onChange( slug );
										setOpen( false );
									} }
								>
									<TabIcon slug={ slug } />
								</Button>
							) ) }
						</div>
					</div>
				</Popover>
			) }
		</div>
	);
}
