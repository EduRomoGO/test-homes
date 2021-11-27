/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React, { ChangeEvent } from "react";
import { SyntheticEvent } from "react";
import dayjs from "dayjs";
import { useAsync } from "hooks/useAsync";

const Fieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  padding: 8px 170px 12px 8px;
  &:not(:first-of-type) {
    margin-top: 24px;
  }
`;

const Label = styled.label`
  margin-bottom: 2px;
  &:not(:first-of-type) {
    margin-top: 8px;
  }
`;

interface EmployerForApi {
  name: string;
  start_date: string;
  end_date: string;
}
interface FormDataForApi {
  personal: {
    first_name: string;
    last_name: string;
    current_address: string;
  };
  employer: EmployerForApi[];
}

const fakeApiCall = (formData: FormDataForApi) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res({ status: 200 });
    }, 1500);
  });
};

type TimePeriod = "day" | "month";

const getDatesDiff = (
  timePeriod: TimePeriod,
  startDate: Date,
  endDate: Date | null
) => {
  const startDateObj = dayjs(startDate);
  const endDayObj = endDate ? dayjs(endDate) : dayjs();

  return endDayObj.diff(startDateObj, timePeriod);
};

function FormResult({
  status,
  validationError,
}: {
  status: string;
  validationError: boolean;
}) {
  if (validationError) {
    return <div role="alert">Error</div>;
  }

  if (status === "pending") {
    return <div>Loading...</div>;
  }

  if (status === "resolved") {
    return <div>Form successfully submited</div>;
  }

  return null;
}

interface Employer {
  id: string;
  name?: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface EmployersObj {
  [key: string]: Employer;
}

function EmployerFields({
  onChange,
  employerId,
}: {
  onChange: (employer: Employer) => void;
  employerId: string;
}) {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [name, setName] = React.useState("");

  const handleStartDateChange = (event: ChangeEvent) => {
    if ((event?.target as HTMLInputElement).valueAsDate) {
      setStartDate((event?.target as HTMLInputElement).valueAsDate);
    }

    onChange({ name, startDate, endDate, id: employerId });
  };

  const handleEndDateChange = (event: ChangeEvent) => {
    if ((event?.target as HTMLInputElement).valueAsDate) {
      setEndDate((event?.target as HTMLInputElement).valueAsDate);
    }

    onChange({ name, startDate, endDate, id: employerId });
  };

  const handleNameChange = (event: ChangeEvent) => {
    if ((event?.target as HTMLInputElement).value) {
      setName((event?.target as HTMLInputElement).value);
    }

    onChange({ name, startDate, endDate, id: employerId });
  };

  return (
    <Fieldset>
      <legend>Employer</legend>

      <Label htmlFor="employer-name">Employer name</Label>
      <input onChange={handleNameChange} type="text" id="employer-name" />

      <Label htmlFor="start-date">Start date</Label>
      <input
        onChange={handleStartDateChange}
        type="date"
        placeholder="yyyy/mm/dd"
        id="start-date"
      />

      <Label htmlFor="end-date">End date</Label>
      <input
        onChange={handleEndDateChange}
        type="date"
        placeholder="yyyy/mm/dd"
        id="end-date"
      />
    </Fieldset>
  );
}

interface FormData {
  personal: {
    firstName?: string;
    lastName?: string;
    currentAddress?: string;
  };
  employer?: Employer[];
}

const transformDataForApi = (formData: FormData) => {
  const transformDate = (date: Date | null) => {
    if (date) {
      return date.toISOString().split("T")[0].replaceAll("-", "");
    }
    return "";
  };

  return {
    personal: {
      first_name: formData.personal.firstName || "",
      last_name: formData.personal.lastName || "",
      current_address: formData.personal.currentAddress || "",
    },
    employer:
      formData.employer?.map((empl) => {
        return {
          name: empl.name || "",
          start_date: transformDate(empl.startDate),
          end_date: transformDate(empl.endDate),
        };
      }) || [],
  };
};

function ReferencingForm() {
  const { status, run } = useAsync();
  const [validationError, setValidationError] = React.useState(false);
  const [employers, setEmployers] = React.useState<EmployersObj>();
  const [showAnotherEmployerFieldset, setShowAnotherEmployerFieldset] =
    React.useState<boolean>(false);

  const gatherFormData = (event: SyntheticEvent) => {
    const formElements: HTMLFormControlsCollection = (
      event.target as HTMLFormElement
    ).elements;

    return {
      personal: {
        firstName: (formElements.namedItem("firstName") as HTMLInputElement)
          ?.value,
        lastName: (formElements.namedItem("lastName") as HTMLInputElement)
          ?.value,
        currentAddress: (
          formElements.namedItem("currentAddress") as HTMLInputElement
        )?.value,
      },
      employer: employers ? Object.values(employers) : undefined,
    };
  };

  const validateData = ({ employer: employerList }: FormData) => {
    if (employerList !== undefined) {
      if (employerList.length > 1) {
        return { valid: true };
      } else {
        if (employerList.length === 0) {
          return { valid: false };
        } else {
          const employer = employerList[0];

          if (employer.startDate) {
            const datesDiffInDays = getDatesDiff(
              "day",
              employer.startDate,
              employer.endDate
            );

            const threeYearsInDays = 365 * 3;

            if (datesDiffInDays < threeYearsInDays) {
              return { valid: false };
            } else {
              return { valid: true };
            }
          }

          return { valid: false };
        }
      }
    }

    return { valid: false };
  };

  const handleFormSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    setValidationError(false);

    const formData = gatherFormData(event);

    const result = validateData(formData);

    if (result.valid) {
      const formDataTransformed = transformDataForApi(formData);
      console.log(formDataTransformed);
      run(fakeApiCall(formDataTransformed));
    } else {
      setValidationError(true);
    }
  };

  const handleEmployerChange = (employer: Employer) => {
    setValidationError(false);
    setEmployers({ ...employers, [employer.id]: employer });
  };

  const shouldShowAnotherEmployerButton = () => {
    if (
      employers !== undefined &&
      Object.keys(employers).length === 1 &&
      !showAnotherEmployerFieldset
    ) {
      const employer = Object.values(employers)[0];

      if (employer.startDate) {
        const datesDiffInDays = getDatesDiff(
          "day",
          employer.startDate,
          employer.endDate
        );
        const threeYearsInDays = 365 * 3;

        return datesDiffInDays < threeYearsInDays;
      }

      return false;
    }

    return false;
  };

  const handleAddAnotherEmployerClick = () => {
    setValidationError(false);
    setShowAnotherEmployerFieldset(true);
  };

  return (
    <div
      css={css`
        margin-top: 80px;
      `}
    >
      <header
        css={css`
          font-weight: bold;
          text-align: center;
          margin-bottom: 40px;
          font-size: 2rem;
        `}
      >
        Referencing form
      </header>

      <form onSubmit={handleFormSubmit}>
        <Fieldset>
          <legend>Personal</legend>
          <Label htmlFor="firstName">First name</Label>
          <input type="text" id="firstName" />

          <Label htmlFor="lastName">Last name</Label>
          <input type="text" id="lastName" />

          <Label htmlFor="currentAddress">Current address</Label>
          <input type="text" id="currentAddress" />
        </Fieldset>

        <EmployerFields
          employerId="employer-1"
          onChange={handleEmployerChange}
        />
        {showAnotherEmployerFieldset && (
          <EmployerFields
            employerId="employer-2"
            onChange={handleEmployerChange}
          />
        )}

        {shouldShowAnotherEmployerButton() && (
          <button onClick={handleAddAnotherEmployerClick}>
            Add another employer
          </button>
        )}

        <FormResult status={status} validationError={validationError} />
        <div
          css={css`
            margin-top: 12px;
            padding-right: 2px;
            display: flex;
            justify-content: right;
          `}
        >
          <button>Cancel</button>
          <button
            css={css`
              margin-left: 16px;
            `}
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReferencingForm;
