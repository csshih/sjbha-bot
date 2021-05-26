import { useEffect } from "preact/hooks";
import * as urls from "../urls";

const checkLogin = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const res = await fetch(urls.LOGIN_API, {
    method: "POST",
    body: JSON.stringify({token}),
    headers: { "Content-Type": "application/json" }
  });

  switch (res.status) {
    case 200:
      const json = await res.json();

      localStorage.setItem("discordId", json.discordId);
      localStorage.setItem("auth-token", json.token);

      if (json.isConnected) {
        window.location.href = urls.SETTINGS;
      } else {
        window.location.href = json.authUrl;
      }
      break;

    case 401:
      document.body.innerHTML = `<p>Something went wrong when validating your token. Try doing <b>!fit auth</b> to get a new link, otherwise let @s3b know something might be broken</p>`
      res.json().then(json => console.error("401 code Unauthorized:", json))
      break;

    default:
      console.error("oops");
      break;
  }
}

const Login = () => {
  useEffect(() => {
    checkLogin()
  }, []);

  return (
    <div className="container">
      <p>Logging In</p>
    </div>
  )
}

export default Login;