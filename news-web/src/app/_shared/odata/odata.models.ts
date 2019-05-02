export enum ODataFilterExpression {
    Equals,
    GreaterThan,
    GreaterOrEqualThan,
    LesserThan,
    LesserOrEqualThan,
    And,
    Or,
    EndsWith,
    StartsWith,
    SubstringOf
}

export const ODataFilterMap: Map<ODataFilterExpression, string> = new Map<ODataFilterExpression, string>([
    [ODataFilterExpression.Equals, 'eq'],
    [ODataFilterExpression.GreaterThan, 'gt'],
    [ODataFilterExpression.GreaterOrEqualThan, 'ge'],
    [ODataFilterExpression.LesserThan, 'lt'],
    [ODataFilterExpression.LesserOrEqualThan, 'le'],
    [ODataFilterExpression.And, 'and'],
    [ODataFilterExpression.Or, 'or'],
    [ODataFilterExpression.StartsWith, 'startswith'],
    [ODataFilterExpression.EndsWith, 'endswith'],
    [ODataFilterExpression.SubstringOf, 'substringof']
]);

export interface ODataFilter {
    operator?: ODataFilterExpression.And | ODataFilterExpression.Or;
    key: string;
    expression: ODataFilterExpression;
    value: string;
}

export interface ODataQuery {
    filters?: ODataFilter[];
    select?: string[];
    top?: number;
}

/**
 * Represents an Azure table storage OData response
 */
export interface ODataResponseDto<T extends ODataValueDto> {
    'odata.metadata': string;
    value: T[];
}

/**
 * Represents an Azure table storage row response
 */
export interface ODataValueDto {
    'odata.etag': string;
    PartitionKey: string;
    RowKey?: string;
    TimeStamp?: Date;
}
