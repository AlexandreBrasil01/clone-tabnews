import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "CloneTabNews <test@mail.com>",
      to: "alexandre.l.brasil@gmail.com",
      subject: "Teste de nodemailer",
      text: "Teste de Corpo.",
    });

    await email.send({
      from: "CloneTabNews <test@email.com>",
      to: "alexandre@gmail.com",
      subject: "Ultimo email",
      text: "Corpo do Ultimo Email.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<test@email.com>");
    expect(lastEmail.recipients[0]).toBe("<alexandre@gmail.com>");
    expect(lastEmail.subject).toBe("Ultimo email");
    expect(lastEmail.text).toBe("Corpo do Ultimo Email.\n");
  });
});
