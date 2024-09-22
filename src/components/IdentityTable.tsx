import { Identity } from "@/models";

export const IdentityTable = (props: {
  className: string | undefined;
  identity: Identity;
}) => {
  const className = `table-fixed w-full ${props.className}`;
  return (
    <table className={className}>
      <caption>Identity</caption>
      <tbody>
        <tr className="odd:bg-gray-100 odd:dark:bg-gray-800 hover:bg-stone-100 hover:dark:bg-gray-600">
          <th className="min-w-48">account</th>
          <td className="break-words overflow-clip">
            {props.identity.account}
          </td>
        </tr>
        <tr className="odd:bg-gray-100 odd:dark:bg-gray-800 hover:bg-stone-100 hover:dark:bg-gray-600">
          <th>arn</th>
          <td className="break-words overflow-clip">{props.identity.arn}</td>
        </tr>
        <tr className="odd:bg-gray-100 odd:dark:bg-gray-800 hover:bg-stone-100 hover:dark:bg-gray-600">
          <th>user-id</th>
          <td className="break-words overflow-clip">{props.identity.userId}</td>
        </tr>
      </tbody>
    </table>
  );
};
