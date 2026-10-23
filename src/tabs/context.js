import { createContext } from '@wordpress/element';

/** Client id of the tab whose panel is shown in the editor (null: show all). */
export const ActiveTabContext = createContext( null );
