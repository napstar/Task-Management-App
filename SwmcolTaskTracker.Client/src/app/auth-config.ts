import { LogLevel, Configuration, BrowserCacheLocation } from '@azure/msal-browser';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

export const msalConfig: Configuration = {
    auth: {
        clientId: '8105c32b-15b0-41bd-9245-0e92a81d1e4c',
        authority: 'https://login.microsoftonline.com/b534e0ad-dfd9-4556-aa73-8c12b9a264fd',
        redirectUri: window.location.origin + '/',
        postLogoutRedirectUri: window.location.origin + '/'
    },
    cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            }
        }
    }
};

export const protectedResources = {
    api: {
        endpoint: "https://app-swmcol-task-mgmt-api.azurewebsites.net/api",
        scopes: ["api://8105c32b-15b0-41bd-9245-0e92a81d1e4c/access_as_user"]
    }
};

export const loginRequest = {
    scopes: ["User.Read", ...protectedResources.api.scopes]
};
