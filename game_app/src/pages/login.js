import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const onSubmit = () => {
  
    if (name){
      localStorage.setItem("name", name);
        navigate("/choose_game");
    }
  }
  
  return (
    <div className="flex justify-center">
      <div className="overflow-hidden mt-10  w-1/2 bg-sky-300 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <label
            htmlFor="name"
            className="ml-px block text-xl mb-10 font-medium leading-6 text-white"
          >
            Set your Nickname
          </label>
          <div className="mt-10 mb-5">
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onInput={(e) => setName(e.target.value)}
              className="block w-full  rounded-full border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
              placeholder="John Doe"
            />
          </div>
        </div>
        {/* кнопка должна быть задизейблена, когда нет имени */}
        <button
          onClick={onSubmit}
          type="button"
          className="mb-5 w-1/3 rounded-full bg-white/10 py-1 px-2 text-s font-semibold text-white shadow-sm hover:bg-white/20 focus:ring-2 focus:ring-offset-1 focus:ring-sky-200 "
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default Login;
