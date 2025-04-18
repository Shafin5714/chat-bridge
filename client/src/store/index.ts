import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { store, AppDispatch, RootState } from './store';

export default store;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;