import { useId } from "react";
import {
  HAIR_COLOURS,
  HAIR_STYLES,
  SKIN_TONES,
  type AvatarLook,
  type HairColourId,
  type OutfitStyleId,
} from "../../engine/avatar";
import { MAX_NAME_LENGTH } from "../../engine/profile";
import { Avatar, AvatarFigure } from "../art/avatar/Avatar";
import { optionLabel } from "./optionLabel";
import { SwatchRow } from "./SwatchRow";
import "./newGameKit.css";

export interface AvatarChoices {
  readonly hairColours: readonly HairColourId[];
  readonly outfits: readonly OutfitStyleId[];
}

export interface AvatarStepProps {
  name: string;
  look: AvatarLook;
  options: AvatarChoices;
  role: string;
  nameIssue: string | null;
  onName: (name: string) => void;
  onLook: (look: AvatarLook) => void;
}

export function AvatarStep({ name, look, options, role, nameIssue, onName, onLook }: AvatarStepProps) {
  const nameId = useId();
  const hintId = useId();
  const change = (patch: Partial<AvatarLook>) => onLook({ ...look, ...patch });
  const trimmed = name.trim();
  return (
    <div className="ad-avatar-step">
      <figure className="ad-avatar-step__stage">
        <div className="ad-avatar-step__halo" aria-hidden="true" />
        <Avatar
          key={`${look.hairStyle}-${look.outfit}`}
          variant="full"
          look={look}
          mood="delighted"
          className="ad-avatar-step__figure"
          title={trimmed.length > 0 ? `${trimmed}, your ${role}` : `Your ${role}`}
        />
        <div className="ad-avatar-step__plinth" aria-hidden="true" />
        <figcaption className="ad-avatar-step__caption">
          {trimmed.length > 0 ? trimmed : `Your ${role}`}
        </figcaption>
      </figure>
      <div className="ad-avatar-step__controls">
        <div className="ad-field">
          <label htmlFor={nameId} className="ad-field__label">
            Name
          </label>
          <input
            id={nameId}
            className="ad-field__input"
            value={name}
            maxLength={MAX_NAME_LENGTH + 8}
            autoComplete="off"
            spellCheck={false}
            placeholder="What should clients call you?"
            aria-describedby={hintId}
            aria-invalid={nameIssue !== null && name.length > 0}
            onChange={(event) => onName(event.target.value)}
          />
          <span id={hintId} className="ad-field__hint">
            {nameIssue !== null && name.length > 0
              ? nameIssue
              : `Up to ${MAX_NAME_LENGTH} characters. It stays on this device.`}
          </span>
        </div>
        <fieldset className="ad-fieldset">
          <legend className="ad-field__label">Skin tone</legend>
          <SwatchRow
            label="Skin tone"
            options={SKIN_TONES}
            value={look.skinTone}
            onChange={(skinTone) => change({ skinTone })}
          />
        </fieldset>
        <fieldset className="ad-fieldset">
          <legend className="ad-field__label">Hair style</legend>
          <div className="ad-tile-grid ad-tile-grid--hair" role="radiogroup" aria-label="Hair style">
            {HAIR_STYLES.map((hairStyle) => (
              <button
                key={hairStyle}
                type="button"
                role="radio"
                aria-checked={hairStyle === look.hairStyle}
                className="ad-tile"
                onClick={() => change({ hairStyle })}
              >
                <Avatar look={{ ...look, hairStyle }} size={52} title={optionLabel(hairStyle)} />
                <span className="ad-tile__label">{optionLabel(hairStyle)}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="ad-fieldset">
          <legend className="ad-field__label">Hair colour</legend>
          <SwatchRow
            label="Hair colour"
            options={HAIR_COLOURS.filter((colour) => options.hairColours.includes(colour.id))}
            value={look.hairColour}
            onChange={(hairColour) => change({ hairColour })}
          />
        </fieldset>
        <fieldset className="ad-fieldset">
          <legend className="ad-field__label">Outfit</legend>
          <div className="ad-tile-grid ad-tile-grid--outfit" role="radiogroup" aria-label="Outfit">
            {options.outfits.map((outfit) => (
              <button
                key={outfit}
                type="button"
                role="radio"
                aria-checked={outfit === look.outfit}
                className="ad-tile ad-tile--outfit"
                onClick={() => change({ outfit })}
              >
                <svg
                  className="ad-tile__crop"
                  viewBox="100 112 200 210"
                  preserveAspectRatio="xMidYMin slice"
                  role="img"
                  aria-label={optionLabel(outfit)}
                >
                  <AvatarFigure look={{ ...look, outfit }} />
                </svg>
                <span className="ad-tile__label">{optionLabel(outfit)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
