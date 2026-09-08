import React, {
  Component,
  FormEvent,
  ChangeEvent,
  createRef,
} from "react";

import "./Chat.css";
import config from "../../config/config";
import wawyLogo from "../../assets/wawy.png";

interface Props {}

interface ChatButton {
  title: string;
  payload: string;
}

interface CarouselItem {
  title: string;
  payload: string;
  imagen?: string;
}

interface RichPayload {
  title?: string;
  src?: string;
}

interface RasaCustom {
  type?: string;
  payload?: string | RichPayload;
  data?: CarouselItem[];
}

interface Message {
  sender: "user" | "bot";
  text?: string;
  buttons?: ChatButton[];
  image?: string;
  custom?: RasaCustom;
  attachment?: RasaCustom;
}

interface RasaResponseMessage {
  recipient_id?: string;
  text?: string;
  buttons?: ChatButton[];
  image?: string;
  custom?: RasaCustom;
  attachment?: RasaCustom;
}

interface ChatApiResponse {
  ok?: boolean;
  message?: string;
  response?: string;
  messages?: RasaResponseMessage[];
}

interface State {
  chatIsActive: boolean;
  message: string;
  messages: Message[];
  sending: boolean;
}

export default class Chat extends Component<Props, State> {
  private messagesEndRef = createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      chatIsActive: true,
      message: "",
      messages: [],
      sending: false,
    };
  }

  componentDidUpdate(
    prevProps: Props,
    prevState: State
  ) {
    if (
      prevState.messages.length !==
        this.state.messages.length ||
      prevState.sending !== this.state.sending
    ) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  openForm = () => {
    this.setState({ chatIsActive: true });
  };

  closeForm = () => {
    this.setState({ chatIsActive: false });
  };

  handleMessageChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    this.setState({
      message: event.target.value,
    });
  };

  normalizeRasaMessages = (
    data: ChatApiResponse
  ): Message[] => {
    if (
      Array.isArray(data.messages) &&
      data.messages.length > 0
    ) {
      return data.messages
        .map(
          (item): Message => ({
            sender: "bot",
            text: item.text,
            buttons: item.buttons,
            image: item.image,
            custom: item.custom,
            attachment: item.attachment,
          })
        )
        .filter(
          (item) =>
            Boolean(item.text) ||
            Boolean(item.image) ||
            Boolean(
              item.buttons &&
                item.buttons.length > 0
            ) ||
            Boolean(item.custom) ||
            Boolean(item.attachment)
        );
    }

    if (data.response) {
      return [
        {
          sender: "bot",
          text: data.response,
        },
      ];
    }

    if (data.message) {
      return [
        {
          sender: "bot",
          text: data.message,
        },
      ];
    }

    return [];
  };

  sendToRasa = async (
    rasaMessage: string,
    visibleText: string
  ) => {
    if (
      this.state.sending ||
      !rasaMessage.trim()
    ) {
      return;
    }

    this.setState((state) => ({
      messages: [
        ...state.messages,
        {
          sender: "user",
          text: visibleText,
        },
      ],
      message: "",
      sending: true,
    }));

    try {
      const response = await fetch(
        `${config.API_URL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            message: rasaMessage,
          }),
        }
      );

      if (response.status === 401) {
        this.setState({ sending: false });
        window.location.href = "/login";
        return;
      }

      const data =
        (await response.json()) as ChatApiResponse;

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Error enviando mensaje"
        );
      }

      const botMessages =
        this.normalizeRasaMessages(data);

      this.setState((state) => ({
        messages: [
          ...state.messages,
          ...(botMessages.length > 0
            ? botMessages
            : [
                {
                  sender: "bot" as const,
                  text:
                    "WAWY no generó una respuesta.",
                },
              ]),
        ],
        sending: false,
      }));
    } catch (error) {
      console.error(
        "Error en chat:",
        error
      );

      this.setState((state) => ({
        messages: [
          ...state.messages,
          {
            sender: "bot",
            text:
              "No fue posible comunicarse con WAWY en este momento.",
          },
        ],
        sending: false,
      }));
    }
  };

  sendMessage = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const message =
      this.state.message.trim();

    if (!message) {
      return;
    }

    await this.sendToRasa(
      message,
      message
    );
  };

  sendButtonPayload = async (
    payload: string,
    title: string
  ) => {
    await this.sendToRasa(
      payload,
      title
    );
  };

  startConversation = async () => {
    await this.sendButtonPayload(
      "/saludo",
      "Hola"
    );
  };

  resolveAssetUrl = (
    src?: string
  ): string | undefined => {
    if (!src) {
      return undefined;
    }

    if (
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:") ||
      src.startsWith("blob:")
    ) {
      return src;
    }

    return src.startsWith("/")
      ? src
      : `/${src}`;
  };

  getVideo = (
    message: Message
  ): RichPayload | undefined => {
    const candidates = [
      message.custom,
      message.attachment,
    ];

    for (const item of candidates) {
      if (
        item?.type === "video" &&
        item.payload &&
        typeof item.payload ===
          "object" &&
        item.payload.src
      ) {
        return item.payload;
      }
    }

    return undefined;
  };

  getCarouselItems = (
    message: Message
  ): CarouselItem[] => {
    const custom = message.custom;

    if (
      custom?.payload ===
        "ButtonsCarusel" &&
      Array.isArray(custom.data)
    ) {
      return custom.data;
    }

    return [];
  };

  renderRichContent = (
    message: Message
  ) => {
    const video =
      this.getVideo(message);

    const carousel =
      this.getCarouselItems(message);

    return (
      <>
        {message.image && (
          <img
            src={this.resolveAssetUrl(
              message.image
            )}
            alt="Contenido enviado por WAWY"
            className="rasa-image"
          />
        )}

        {video?.src && (
          <div className="rasa-video-wrapper">
            <iframe
              src={video.src}
              title={
                video.title ??
                "Video de WAWY"
              }
              className="rasa-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {carousel.length > 0 && (
          <div className="rasa-carousel">
            {carousel.map(
              (item, index) => (
                <button
                  type="button"
                  className="rasa-carousel-card"
                  key={`${item.payload}-${index}`}
                  disabled={
                    this.state.sending
                  }
                  onClick={() =>
                    this.sendButtonPayload(
                      item.payload,
                      item.title
                    )
                  }
                >
                  {item.imagen && (
                    <img
                      src={
                        this.resolveAssetUrl(
                          item.imagen
                        )
                      }
                      alt={item.title}
                      className="rasa-carousel-image"
                    />
                  )}

                  <span>
                    {item.title}
                  </span>
                </button>
              )
            )}
          </div>
        )}

        {message.buttons &&
          message.buttons.length > 0 && (
            <div className="rasa-buttons">
              {message.buttons.map(
                (button, index) => (
                  <button
                    type="button"
                    className="rasa-button"
                    key={`${button.payload}-${index}`}
                    disabled={
                      this.state.sending
                    }
                    onClick={() =>
                      this.sendButtonPayload(
                        button.payload,
                        button.title
                      )
                    }
                  >
                    {button.title}
                  </button>
                )
              )}
            </div>
          )}
      </>
    );
  };

  render() {
    if (!this.state.chatIsActive) {
      return (
        <button
          className="open-button"
          onClick={this.openForm}
          aria-label="Abrir chat"
        >
          <img
            src={wawyLogo}
            alt="WAWY"
            className="open-button-logo"
          />
        </button>
      );
    }

    return (
      <div className="chat-page">
        <div
          className="chat-popup"
          id="myForm"
        >
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar-wrapper">
                <img
                  src={wawyLogo}
                  alt="WAWY"
                  className="chat-avatar"
                />
                <span className="chat-online-dot" />
              </div>

              <div className="chat-header-text">
                <h1>WAWY</h1>
                <p>
                  Tu compañero en el camino
                  académico y emocional
                </p>
              </div>
            </div>

            <div className="chat-header-actions">
              <div className="chat-status">
                <span />
                En línea
              </div>

              <button
                type="button"
                className="chat-close"
                onClick={this.closeForm}
                aria-label="Cerrar chat"
              >
                ×
              </button>
            </div>
          </div>

          <form
            className="form-container"
            onSubmit={this.sendMessage}
          >
            <div className="chat-messages">
              {this.state.messages.length ===
                0 && (
                <div className="message-row bot-row">
                  <div className="message-avatar">
                    <img
                      src={wawyLogo}
                      alt="WAWY"
                    />
                  </div>

                  <div className="message-content">
                    <div className="bot-message">
                      <strong>
                        ¡Hola! 👋
                      </strong>
                      <br />
                      Soy WAWY.
                      <br />
                      Presiona comenzar para
                      iniciar nuestra conversación.
                    </div>

                    <div className="rasa-buttons">
                      <button
                        type="button"
                        className="rasa-button rasa-button-primary"
                        onClick={
                          this.startConversation
                        }
                        disabled={
                          this.state.sending
                        }
                      >
                        Comenzar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {this.state.messages.map(
                (message, index) => {
                  if (
                    message.sender ===
                    "bot"
                  ) {
                    return (
                      <div
                        className="message-row bot-row"
                        key={index}
                      >
                        <div className="message-avatar">
                          <img
                            src={wawyLogo}
                            alt="WAWY"
                          />
                        </div>

                        <div className="message-content">
                          {message.text && (
                            <div className="bot-message">
                              {message.text}
                            </div>
                          )}

                          {this.renderRichContent(
                            message
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      className="message-row user-row"
                      key={index}
                    >
                      <div className="message-content">
                        <div className="user-message">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}

              {this.state.sending && (
                <div className="message-row bot-row">
                  <div className="message-avatar">
                    <img
                      src={wawyLogo}
                      alt="WAWY"
                    />
                  </div>

                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div
                ref={this.messagesEndRef}
              />
            </div>

            <div className="chat-input-area">
              <textarea
                id="msg"
                name="msg"
                placeholder="Escribe tu mensaje..."
                value={this.state.message}
                onChange={this.handleMessageChange}
                rows={1}
                required
                autoFocus
              />

              <button
                type="submit"
                className="send-button"
                disabled={
                  this.state.sending ||
                  !this.state.message.trim()
                }
                aria-label="Enviar mensaje"
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}