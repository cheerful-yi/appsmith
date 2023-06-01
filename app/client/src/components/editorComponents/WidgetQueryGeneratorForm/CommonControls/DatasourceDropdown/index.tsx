import React, { memo, useEffect, useState } from "react";
import { Bold, ErrorMessage, SelectWrapper } from "../../styles";
import { useDatasource } from "./useDatasource";
import { Select, Option, Icon } from "design-system";
import { DropdownOption } from "./DropdownOption";
import styled from "styled-components";
import { Colors } from "constants/Colors";
import type { DropdownOptionType } from "../../types";
import type { DefaultOptionType } from "rc-select/lib/Select";
import { DATASOURCE_DROPDOWN_SECTIONS } from "../../constants";

const SectionHeader = styled.div`
  cursor: default;
  font-weight: 500;
  line-height: 19px;
  color: ${Colors.GREY_900};
`;

function DatasourceDropdown() {
  const {
    datasourceOptions,
    disabled,
    error,
    isSourceOpen,
    onSourceClose,
    otherOptions,
    queryOptions,
    selected,
  } = useDatasource();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isSourceOpen);
  }, [isSourceOpen]);

  return (
    <SelectWrapper className="space-y-2">
      <Select
        className="t--one-click-binding-datasource-selector"
        dropdownClassName="one-click-binding-datasource-dropdown"
        dropdownStyle={{
          minWidth: "350px",
          maxHeight: "300px",
        }}
        filterOption={(value: string, option?: DefaultOptionType) => {
          if (
            [
              DATASOURCE_DROPDOWN_SECTIONS.BIND_TO_QUERY,
              DATASOURCE_DROPDOWN_SECTIONS.GENERATE_A_QUERY,
              DATASOURCE_DROPDOWN_SECTIONS.OTHER_ACTIONS,
            ].includes(option?.value as string)
          ) {
            return false;
          } else {
            return !!option?.value
              ?.toString()
              ?.toLocaleLowerCase()
              .includes(value);
          }
        }}
        isDisabled={disabled}
        isValid={!error}
        onDropdownVisibleChange={(open: boolean) => {
          !open && onSourceClose();
          setOpen(open);
        }}
        onSelect={(value: string, selectedOption: DefaultOptionType) => {
          const option = [
            ...datasourceOptions,
            ...otherOptions,
            ...queryOptions,
          ].find((option) => option.id === selectedOption.key);

          option?.onSelect?.(value, option as DropdownOptionType);
          onSourceClose();
          setOpen(false);
        }}
        open={open}
        placeholder="Connect data"
        showSearch
        value={selected}
        virtual={false}
      >
        {queryOptions.length && (
          <Option
            className="t--one-click-binding-datasource-selector--bind-to-query"
            disabled
            key="Bind to query"
          >
            <SectionHeader>
              {DATASOURCE_DROPDOWN_SECTIONS.BIND_TO_QUERY}
            </SectionHeader>
          </Option>
        )}

        {queryOptions.map((option) => {
          return (
            <Option
              className="t--one-click-binding-datasource-selector--query"
              key={option.id}
              label={option.label}
              value={option.label}
            >
              <DropdownOption label={option.label} leftIcon={option.icon} />
            </Option>
          );
        })}

        <Option
          className={`${
            queryOptions.length && "has-seperator"
          } t--one-click-binding-datasource-selector--generate-a-query`}
          disabled
          key="Generate a query"
        >
          <SectionHeader>
            {DATASOURCE_DROPDOWN_SECTIONS.GENERATE_A_QUERY}
          </SectionHeader>
        </Option>

        {datasourceOptions.map((option) => {
          return (
            <Option
              data-testid="t--one-click-binding-datasource-selector--datasource"
              key={option.id}
              value={option.label}
            >
              <DropdownOption
                label={
                  <>
                    New from {option.data.isSample ? "sample " : ""}
                    <Bold>{option.label?.replace("sample ", "")}</Bold>
                  </>
                }
                leftIcon={option.icon}
                rightIcon={<Icon name="add-box-line" size="md" />}
              />
            </Option>
          );
        })}

        <Option
          className="has-seperator t--one-click-binding-datasource-selector--other-actions"
          disabled
          key="Other actions"
        >
          <SectionHeader>
            {DATASOURCE_DROPDOWN_SECTIONS.OTHER_ACTIONS}
          </SectionHeader>
        </Option>

        {otherOptions.map((option: DropdownOptionType) => {
          return (
            <Option
              className="t--one-click-binding-datasource-selector--other-action"
              key={option.id}
              value={option.label}
            >
              <DropdownOption label={option.label} leftIcon={option.icon} />
            </Option>
          );
        })}
      </Select>
      <ErrorMessage>{error}</ErrorMessage>
    </SelectWrapper>
  );
}

export default memo(DatasourceDropdown);
