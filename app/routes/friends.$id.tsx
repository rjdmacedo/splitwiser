import { useParams } from "@remix-run/react";
import React from "react";

export default function FriendPage() {
  const params = useParams();
  return (
    <div>
      <h1>Friend {params.id}</h1>
    </div>
  );
}
