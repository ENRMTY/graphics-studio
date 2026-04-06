import type {
  TransferData,
  TransferKind,
  TransferStatus,
  TransferCurrency,
  Team,
} from "@types";
import { TeamPicker } from "./TeamPicker";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  data: TransferData;
  onChange: (d: TransferData) => void;
  teams: Team[];
  onTeamSave: (t: Team) => void;
}

const KIND_OPTIONS: { value: TransferKind; label: string }[] = [
  { value: "transfer", label: "Transfer" },
  { value: "free", label: "Free Transfer" },
  { value: "loan", label: "Loan" },
];

const CURRENCIES: { value: TransferCurrency; label: string }[] = [
  { value: "£", label: "£  GBP" },
  { value: "€", label: "€  EUR" },
  { value: "$", label: "$  USD" },
];

export function TransferPanel({ data, onChange, teams, onTeamSave }: Props) {
  const bgUpload = useFileUpload((url, file) =>
    onChange({ ...data, bgImage: url, bgImageFile: file }),
  );

  const setKind = (transferKind: TransferKind) =>
    onChange({ ...data, transferKind });
  const setStatus = (status: TransferStatus) => onChange({ ...data, status });
  const setCurrency = (currency: TransferCurrency) =>
    onChange({ ...data, currency });

  return (
    <div className="panel-body">
      {/* status toggle */}
      <div>
        <div className="section-label">Transfer Status</div>
        <div className="tab-row" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={data.status === "confirmed"}
            className={`tab ${data.status === "confirmed" ? "active" : ""}`}
            onClick={() => setStatus("confirmed")}
          >
            ✓ Confirmed
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={data.status === "rumour"}
            className={`tab ${data.status === "rumour" ? "active" : ""}`}
            onClick={() => setStatus("rumour")}
          >
            ? Rumour
          </button>
        </div>
      </div>

      {/* background */}
      <div>
        <div className="section-label">Player Background Image</div>
        <input {...bgUpload.inputProps} />
        {data.bgImage ? (
          <div className="bg-preview-row">
            <div className="bg-thumb">
              <img src={data.bgImage} alt="" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="team-name-display" style={{ fontSize: 12 }}>
                Background set
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={bgUpload.open}>
              Replace
            </button>
          </div>
        ) : (
          <div className="upload-zone" onClick={bgUpload.open}>
            <Icons.Image style={{ width: 20, height: 20 }} />
            <span>Upload player photo</span>
            <p>Best with player facing right</p>
          </div>
        )}
      </div>

      {/* player name */}
      <div>
        <div className="section-label">Player Name</div>
        <input
          className="input"
          placeholder="e.g. Mohamed Salah"
          value={data.playerName}
          onChange={(e) => onChange({ ...data, playerName: e.target.value })}
        />
      </div>

      {/* from / to teams */}
      <TeamPicker
        label="From Club"
        value={data.fromTeam}
        onChange={(team) => onChange({ ...data, fromTeam: team })}
        teams={teams}
        onNewTeamSave={onTeamSave}
      />
      <TeamPicker
        label="To Club"
        value={data.toTeam}
        onChange={(team) => onChange({ ...data, toTeam: team })}
        teams={teams}
        onNewTeamSave={onTeamSave}
      />

      {/* transfer type */}
      <div>
        <div className="section-label">Transfer Type</div>
        <div className="tab-row" role="tablist">
          {KIND_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={data.transferKind === value}
              className={`tab ${data.transferKind === value ? "active" : ""}`}
              onClick={() => setKind(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* fee + currency */}
      {data.transferKind === "transfer" && (
        <div>
          <div className="section-label">Transfer Fee</div>

          {/* currency row */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            {CURRENCIES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`btn btn-sm ${data.currency === value ? "btn-primary" : "btn-ghost"}`}
                style={{
                  minWidth: 0,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                onClick={() => setCurrency(value)}
                title={label}
              >
                {value}
              </button>
            ))}
          </div>

          {/* fee amount input */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-muted)",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {data.currency}
            </span>
            <input
              className="input"
              style={{ paddingLeft: data.currency.length > 1 ? 30 : 24 }}
              placeholder="85m, 120m, Undisclosed…"
              value={data.fee}
              onChange={(e) => onChange({ ...data, fee: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
