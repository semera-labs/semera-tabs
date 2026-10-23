import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import edit from './edit';
import save from './save';
import '../tab';
import './style.css';
import './editor.css';

registerBlockType( metadata, { edit, save } );
