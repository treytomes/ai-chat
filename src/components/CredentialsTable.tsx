import { Credentials } from "@/models";

export const CredentialsTable = (props: {
  className: string | undefined;
  credentials: Credentials;
}) => {
  const className = `table-fixed w-full ${props.className}`;
  return (
    <table className={className}>
      <caption>Credentials</caption>
      <tbody>
        <tr className="odd:bg-gray-100 odd:dark:bg-gray-800 hover:bg-stone-100 hover:dark:bg-gray-600">
          <th className="min-w-48">access-key-id</th>
          <td className="break-words overflow-clip">
            {props.credentials.accessKeyId}
          </td>
        </tr>
        <tr className="odd:bg-gray-100 odd:dark:bg-gray-800 hover:bg-stone-100 hover:dark:bg-gray-600">
          <th>secret-access-key</th>
          <td className="break-words overflow-clip">
            {props.credentials.secretAccessKey}
          </td>
        </tr>
        <tr className="odd:bg-gray-100 odd:dark:bg-gray-800 hover:bg-stone-100 hover:dark:bg-gray-600">
          <th>session-token</th>
          <td className="break-words overflow-clip">
            {props.credentials.sessionToken}
          </td>
        </tr>
        <tr className="odd:bg-gray-100 odd:dark:bg-gray-800 hover:bg-stone-100 hover:dark:bg-gray-600">
          <th>expiration</th>
          <td className="break-words overflow-clip">
            {props.credentials.expiration.toJSDate().toLocaleString()}
          </td>
        </tr>
      </tbody>
    </table>
  );
};
