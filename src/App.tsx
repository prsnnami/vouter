import React, { useEffect } from "react";
import "./App.css";
import Router, { RouteType, RouterView } from "./router";

function Home(props: any) {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}

function User(props: any) {
  console.log(props);
  return <h2>User Page</h2>;
}

const routes: RouteType[] = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/users",
    component: Users
  },
  {
    path: "/users/:id/:uid",
    component: User
  },
  {
    path: "/about",
    component: About
  }
];

const App: React.FC = () => {
  return (
    <Router routes={routes}>
      <RouterView />
    </Router>
  );
};

export default App;
