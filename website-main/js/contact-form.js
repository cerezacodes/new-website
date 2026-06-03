const form = document.querySelector("#contact-form");

if (form) {
    const formEndpoint = "https://formspree.io/f/mdajqlzl";
    const email = form.querySelector("#email");
    const message = form.querySelector("#message");
    const status = form.querySelector("#form-status");
    const submitButton = form.querySelector(".submit-btn");
    const fields = [email, message];
    const draftKey = "lightsOutContactDraft";

    let savedDraft = {};

    try {
        savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
    } catch {
        localStorage.removeItem(draftKey);
    }

    email.value = savedDraft.email || "";
    message.value = savedDraft.message || "";

    const setError = (field, text) => {
        const error = form.querySelector(`#${field.id}-error`);
        field.classList.toggle("has-error", Boolean(text));
        error.textContent = text;
    };

    const validate = () => {
        let isValid = true;
        const trimmedMessage = message.value.trim();

        setError(email, "");
        setError(message, "");

        if (!email.validity.valid) {
            setError(email, "Please enter a valid email address.");
            isValid = false;
        }

        if (trimmedMessage.length < 10) {
            setError(message, "Please write at least 10 characters.");
            isValid = false;
        }

        return isValid;
    };

    const isConfigured = () => !formEndpoint.includes("YOUR_FORM_ID");

    const setLoading = (loading) => {
        submitButton.disabled = loading;
        submitButton.textContent = loading ? "Sending..." : "Send";
    };

    fields.forEach((field) => {
        field.addEventListener("input", () => {
            localStorage.setItem(draftKey, JSON.stringify({
                email: email.value,
                message: message.value
            }));

            if (field.classList.contains("has-error")) {
                validate();
            }

            status.textContent = "";
            status.className = "form-status";
        });
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validate()) {
            status.textContent = "Fix the highlighted fields and try again.";
            status.className = "form-status is-error";
            return;
        }

        if (!isConfigured()) {
            status.textContent = "Add your Formspree form ID in js/contact-form.js before sending.";
            status.className = "form-status is-error";
            return;
        }

        setLoading(true);
        status.textContent = "";
        status.className = "form-status";

        try {
            const response = await fetch(formEndpoint, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("The message could not be sent.");
            }

            localStorage.removeItem(draftKey);
            form.reset();
            status.textContent = "Thanks. Your message was sent.";
            status.className = "form-status is-success";
        } catch {
            status.textContent = "Sorry, the message could not be sent. Please try again.";
            status.className = "form-status is-error";
        } finally {
            setLoading(false);
        }
    });
}
