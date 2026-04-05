import type { TransferData, TransferKind, TransferStatus, Team } from "@types";
import { TeamPicker } from "./TeamPicker";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  data: TransferData;
  onChange: (d: TransferData) => void;
  teams: Team[];
  onTeamSave: (t: Team) => void;
}

const KIND_OPTIONS: { value: TransferKind; label: string; desc: string }[] = [
  { value: "transfer", label: "Transfer", desc: "Permanent move with fee" },
  { value: "free", label: "Free Transfer", desc: "No fee involved" },
  { value: "loan", label: "Loan", desc: "Temporary move" },
];

export function TransferPanel({ data, onChange, teams, onTeamSave }: Props) {
  const bgUpload = useFileUpload((url, file) =>
    onChange({ ...data, bgImage: url, bgImageFile: file }),
  );

  const setKind = (kind: TransferKind) =>
    onChange({ ...data, transferKind: kind });
  const setStatus = (status: TransferStatus) => onChange({ ...data, status });

  return (
    <div className="panel-body">
      {/* Status toggle */}
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

      {/* Background */}
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

      {/* Player name */}
      <div>
        <div className="section-label">Player Name</div>
        <input
          className="input"
          placeholder="e.g. Mohamed Salah"
          value={data.playerName}
          onChange={(e) => onChange({ ...data, playerName: e.target.value })}
        />
      </div>

      {/* From team */}
      <TeamPicker
        label="From Club"
        value={data.fromTeam}
        onChange={(team) => onChange({ ...data, fromTeam: team })}
        teams={teams}
        onNewTeamSave={onTeamSave}
      />

      {/* To team */}
      <TeamPicker
        label="To Club"
        value={data.toTeam}
        onChange={(team) => onChange({ ...data, toTeam: team })}
        teams={teams}
        onNewTeamSave={onTeamSave}
      />

      {/* Transfer kind */}
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

      {/* Fee — only for permanent transfers */}
      {data.transferKind === "transfer" && (
        <div>
          <div className="section-label">Transfer Fee</div>
          <input
            className="input"
            placeholder="e.g. £85m, €120m, Undisclosed"
            value={data.fee}
            onChange={(e) => onChange({ ...data, fee: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
