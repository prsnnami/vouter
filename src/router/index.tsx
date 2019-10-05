import React, { useState, useContext, useRef, useEffect } from "react";
import {
  createBrowserHistory as createHistory,
  Location,
  History
} from "history";
import invariant from "tiny-invariant";
import pathToRegexp from "path-to-regexp";

import useBeforeMount from "./useBeforeMount";

export type RouteType = {
  path: string;
  component: any;
};

type RouterContextProps = {
  location: Location;
  routes: RouteType[];
  history: History;
};

const isEmptyObject = (obj: Object) => Object.keys(obj).length > 0;
function stripTrailingSlash(path: string): string {
  if (path.length < 2) {
    return path;
  }
  return path.replace(/\/$/, "");
}
const RouterContext = React.createContext<Partial<RouterContextProps>>({});

const Router: React.FC<{ routes: RouteType[] }> = ({ routes, children }) => {
  const history = createHistory();
  const mounted = useRef<Boolean>(false);
  const listener = useRef<Function | null>(null);

  const [location, setLocation] = useState<Location>(history.location);

  useBeforeMount(() => {
    listener.current = history.listen((location, action) => {
      if (mounted.current) {
        console.group("Location Change");
        {
          console.log("action", action);
          console.log("history", history);
          console.log("location", location);
        }
        console.groupEnd();
        setLocation(location);
      }
    });
  });

  useEffect(() => {
    mounted.current = true;
    return () => {
      if (listener.current) listener.current();
    };
  }, []);

  return (
    <RouterContext.Provider
      value={{
        location,
        routes,
        history
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

function match(location: Location, routes: RouteType[]) {
  const { pathname: path, key, search } = location;

  let keys: any = [];
  const regex = pathToRegexp(stripTrailingSlash(path), keys, { end: true });
  console.log(regex);
  console.log(regex.exec("/users/123"));
  let route = routes.filter(i => regex.test(i.path));
  console.log(route);
  return routes[0].component;
}

export const RouterView: React.FC = () => {
  const context = useContext(RouterContext);
  invariant(
    isEmptyObject(context),
    "Cant use <RouterView> outside of <Router>"
  );
  const { location, routes } = context;

  const component = match(location!, routes!);

  return React.createElement(component);
};

export default Router;
