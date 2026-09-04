// helper — find a functionCall part anywhere in the parts array..
export default function findFunctionCall(parts) {
  return parts?.find((p) => p.functionCall) || null;
}
