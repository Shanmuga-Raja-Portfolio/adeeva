import { Icon } from "../../../../../../ui/kit/IconSet";
import { conditionById, findById, type FlipRun, type OwnedFind } from "../../../../core";
import { FindArt } from "../../../art/FindArt";
import { findCloth } from "../../../art/findCloth";
import { ProductPreview } from "../../../art/ProductPreview";

export interface BeforeAfterProps {
  readonly run: FlipRun;
  readonly main: OwnedFind | null;
  readonly name: string;
}

export function BeforeAfter({ run, main, name }: BeforeAfterProps) {
  const find = main === null ? null : findById(main.findId);
  return (
    <div className="tf-split" data-testid="before-after">
      <figure className="tf-split__before">
        <span className="tf-split__label">Before</span>
        {find !== null && main !== null ? (
          <>
            <FindArt find={find} grade={main.grade} size={150} />
            <figcaption>
              {conditionById(main.grade).name} {find.name}
            </figcaption>
          </>
        ) : null}
      </figure>
      <span className="tf-split__arrow" aria-hidden="true">
        <Icon name="sparkle" size={28} />
      </span>
      <figure className="tf-split__after">
        <span className="tf-split__label">After</span>
        <ProductPreview
          design={run.design}
          cloth={find === null ? null : findCloth(find)}
          finishes={run.finishes}
          title={name}
          className="tf-split__art"
        />
        <figcaption>{name}</figcaption>
      </figure>
    </div>
  );
}
