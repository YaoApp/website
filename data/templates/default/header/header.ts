/**
 * OpenDashboard
 */
this.OpenDashboard = function (
  event: Event,
  data: Record<string, any>,
  comp: HTMLElement
) {
  const redirectURL = "/admin/auth";
  // @ts-ignore
  const yao = new Yao();
  yao
    .Post("/auth/auto-login")
    .then((response) => {
      if (response.code && response.message) {
        throw new Error(response.message);
      }
      const url = `${redirectURL}?data=${response.base64}`;
      window.location.href = url;
    })
    .catch((error) => {
      console.error("login error", error);
    });
};
