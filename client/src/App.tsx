import { Route, Switch } from "wouter";
import Home from "./pages/Home";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Switch>
        <Route path="/" component={Home} />
        <Route>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600">ページが見つかりません</p>
              <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                トップに戻る
              </a>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

export default App;
