export default function DemoBanner({ role }) {
  const credentials =
    role === "admin"
      ? {
          email: "syed@gemail.com",
          password: "12345678"
        }
      : {
          email: "zeeshan@gmail.com",
          password: "12345678"
        };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="font-semibold text-blue-800">
        Demo Access
      </p>

      <p className="text-blue-700 mt-1">
        Server may take <b>30–40 seconds</b> to start on first request.
      </p>

      <div className="mt-2 text-blue-900">
        <p><b>Email:</b> {credentials.email}</p>
        <p><b>Password:</b> {credentials.password}</p>
      </div>
    </div>
  );
}