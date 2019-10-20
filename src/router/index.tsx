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

const RouterContext = React.createContext<RouterContextProps>(
  {} as RouterContextProps
);

const Router: React.FC<{ routes: RouteType[] }> = ({ routes, children }) => {
  const history = createHistory();
  const mounted = useRef<Boolean>(false);
  const listener = useRef<Function | null>(null);

  const [location, setLocation] = useState<Location>(history.location);

  useEffect(() => {
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
  }, []);

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

  const patterns = routes.map(route => {
    let keys: any = [];
    let pattern = pathToRegexp(stripTrailingSlash(route.path), keys);
    return {
      pattern,
      keys,
      route
    };
  });

  console.log("patterns", patterns);

  let match = patterns.find(i => i.pattern.test(path));

  if (!match) {
    return null;
  }

  if (match.keys) {
    let params = match.keys.reduce((prev: any, key: any, index: number) => {
      let values = match!.pattern.exec(path) || [];
      return {
        ...prev,
        [key.name]: values[index + 1]
      };
    }, {});
    console.log("params", params);
  }

  console.log("match", match);
  return match;
}

export const RouterView: React.FC = () => {
  const context = useContext(RouterContext);
  invariant(
    isEmptyObject(context),
    "Cant use <RouterView> outside of <Router>"
  );
  const { location, routes } = context;

  const matchObj = match(location, routes!);

  if (!matchObj) return null;

  const { pattern, keys, route } = matchObj;

  return React.createElement(route.component);
};

export default Router;
