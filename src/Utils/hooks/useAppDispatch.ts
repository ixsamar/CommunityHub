import {useDispatch} from 'react-redux';
import type {AppDispatch} from '../../Store/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
