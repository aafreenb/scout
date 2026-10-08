const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type Business = {
  id: number;
  name: string;
  industry: string;
  city: string;
};

export type CreateBusinessInput = {
  name: string;
  industry: string;
  city: string;
};

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function getBusinesses() {
  return request<Business[]>("/businesses");
}

export function createBusiness(data: CreateBusinessInput) {
  return request<Business>("/businesses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteBusiness(id: number) {
  return request<void>(`/businesses/${id}`, {
    method: "DELETE",
  });
}