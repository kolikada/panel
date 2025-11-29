import React from 'react';
import { Route, Switch } from 'react-router-dom';
import LoginContainer from '@/components/auth/LoginContainer';
import ForgotPasswordContainer from '@/components/auth/ForgotPasswordContainer';
//import ResetPasswordContainer from '@/components/auth/ResetPasswordContainer';
import LoginCheckpointContainer from '@/components/auth/LoginCheckpointContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import { useLocation } from 'react-router';
import tw from 'twin.macro';

export default () => {
    //const history = useHistory();
    const location = useLocation();
    //const { path } = useRouteMatch();

    return (
        // Full-screen wrapper with background image
        <div
            css={tw`min-h-screen flex items-center justify-center relative bg-cover bg-center bg-no-repeat`}
            style={{ backgroundImage: 'url("/assets/images/Tekkuralogin.png")' }}
        >
            <Switch location={location}>
                <Route path={'/auth/login'} component={LoginContainer} exact />
                <Route path={'/auth/password'} component={ForgotPasswordContainer} />
                <Route path={'/auth/checkpoint'} component={LoginCheckpointContainer} />
                <Route path={'*'} component={NotFound} />
            </Switch>
        </div>
    );
};
