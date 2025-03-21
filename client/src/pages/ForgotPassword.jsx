import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useForgotPasswordMutation } from "../redux/slices/api/userApiSlice";
import { toast } from "sonner";
import Loading from "../components/Loader";

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const submitHandler = async (data) => {
    try {
      const result = await forgotPassword({ email: data.email }).unwrap();
      setEmailSent(true);
      toast.success(result.message || "Password reset link sent to your email");
    } catch (error) {
      console.error("Error sending password reset", error);
      toast.error(
        error?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]">
      <div className="w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center">
        {/* left side */}
        <div className="h-full w-full lg:w-2/3 flex flex-col items-center justify-center">
          <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20">
            {/* <span className="flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base bordergray-300 text-gray-600">
              Forgot your password ?
            </span> */}
            <p className="flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700">
              <span>Password</span>
              <span>Recovery</span>
            </p>

            <div className="cell">
              <div className="circle rotate-in-up-left"></div>
            </div>
          </div>
        </div>

        {/* right side */}
        <div className="w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center">
          {emailSent ? (
            <div className="w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-green-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to your email address. Please
                  check your inbox.
                </p>
                <Link to="/log-in">
                  <Button
                    label="Back to Login"
                    className="w-full h-10 bg-blue-700 text-white rounded-full"
                  />
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(submitHandler)}
              className="form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14"
            >
              <div className="">
                <p className="text-blue-600 text-3xl font-bold text-center">
                  Forgot Password
                </p>
                <p className="text-center text-base text-gray-700 mt-2">
                  Enter your email address to receive a password reset link.
                </p>
              </div>

              <div className="flex flex-col gap-y-5">
                <Textbox
                  placeholder="email@example.com"
                  type="email"
                  name="email"
                  label="Email Address"
                  className="w-full rounded-full"
                  register={register("email", {
                    required: "Email Address is required!",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                  })}
                  error={errors.email ? errors.email.message : ""}
                />

                {isLoading ? (
                  <Loading />
                ) : (
                  <Button
                    type="submit"
                    label="Send Reset Link"
                    className="w-full h-10 bg-blue-700 text-white rounded-full"
                  />
                )}

                <div className="text-center mt-4">
                  <Link
                    to="/log-in"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
