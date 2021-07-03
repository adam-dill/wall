import React, {useReducer} from 'react';

export const AppContext = React.createContext();

const data = {
    user: {},
}

function appReducer(state, action) {
    return {
        ...state, 
        ...action.payload
    };
}

function AppProvider({children}) {
    const [state, dispatch] = useReducer(appReducer, data);
    // NOTE: you *might* need to memoize this value
    // Learn more in http://kcd.im/optimize-context
    const value = {state, dispatch}
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppProvider;