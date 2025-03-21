import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useResetPasswordMutation } from "../redux/slices/api/userApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import { toast } from "sonner";
import Loading from "../components/Loader";

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const submitHandler = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const result = await resetPassword({
        resetToken,
        password: data.password,
      }).unwrap();

      // Set user credentials if returned from API
      if (result.user) {
        dispatch(setCredentials(result.user));
      }

      toast.success("Password reset successful");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error resetting password", error);
      toast.error(
        error?.data?.message ||
          error.message ||
          "Invalid or expired reset token"
      );
    }
  };

  // Watch password for validation
  const password = watch("password");

  return (
    <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]">
      <div className="w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center">
        {/* left side */}
        <div className="h-full w-full lg:w-2/3 flex flex-col items-center justify-center">
          <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20">
            <span className="flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base bordergray-300 text-gray-600">
              Create a new password!
            </span>
            <p className="flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700">
              <span>Reset Your</span>
              <span>Password</span>
            </p>

            <div className="cell">
              <div className="circle rotate-in-up-left"></div>
            </div>
          </div>
        </div>

        {/* right side */}
        <div className="w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center">
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14"
          >
            <div className="">
              <p className="text-blue-600 text-3xl font-bold text-center">
                New Password
              </p>
              <p className="text-center text-base text-gray-700 mt-2">
                Please create a strong, new password
              </p>
            </div>

            <div className="flex flex-col gap-y-5">
              <Textbox
                placeholder="Your new password"
                type="password"
                name="password"
                label="New Password"
                className="w-full rounded-full"
                register={register("password", {
                  required: "Password is required!",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={errors.password ? errors.password.message : ""}
              />

              <Textbox
                placeholder="Confirm your password"
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                className="w-full rounded-full"
                register={register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                error={
                  errors.confirmPassword ? errors.confirmPassword.message : ""
                }
              />

              {isLoading ? (
                <Loading />
              ) : (
                <Button
                  type="submit"
                  label="Reset Password"
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
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
