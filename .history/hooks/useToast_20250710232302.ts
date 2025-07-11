// hooks/useToast.ts
export function useToast() {
    return {
      toast: {
        success: (msg: string) => alert(msg),
        error: (msg: string) => alert(msg),
        info: (msg: string) => alert(msg),
      },
    };
  }
  